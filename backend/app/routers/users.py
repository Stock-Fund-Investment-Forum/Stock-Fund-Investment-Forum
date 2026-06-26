from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas, auth, models
from app.database import get_db
from sqlalchemy import func, text

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[schemas.UserOut])
def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    nickname: str = Query(None),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * per_page
    q = db.query(crud.models.User).filter(crud.models.User.is_deleted == False)
    if nickname:
        q = q.filter(crud.models.User.nickname.ilike(f"%{nickname}%"))
    users = q.offset(offset).limit(per_page).all()
    return users


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user=Depends(auth.get_current_user)):
    return current_user


@router.get("/me/favorites", response_model=List[schemas.PostOut])
def list_my_favorites(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    post_ids = (
        db.query(models.Engagement.content_id)
        .filter(
            models.Engagement.user_id == current_user.user_id,
            models.Engagement.engagement_type == "BOOKMARK",
            models.Engagement.content_type == "POST",
        )
        .order_by(models.Engagement.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    ids = [row[0] for row in post_ids]
    if not ids:
        return []
    posts = (
        db.query(models.Post)
        .filter(models.Post.post_id.in_(ids), models.Post.is_deleted == False)
        .all()
    )
    post_map = {p.post_id: p for p in posts}
    return [post_map[pid] for pid in ids if pid in post_map]


@router.post("", response_model=schemas.UserOut, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, email=user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = crud.create_user(db, user=user)
    return db_user


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: str,
    user_update: schemas.UserBase,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # simple ownership check
    if current_user.user_id != user_id:
        raise HTTPException(status_code=401, detail="Not authorized")
    db_user = crud.update_user(db, user_id=user_id, user=user_update)
    return db_user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: str, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)
):
    # allow user delete themselves or admins (not implemented admin check here)
    if current_user.user_id != user_id:
        raise HTTPException(status_code=401, detail="Not authorized")
    crud.soft_delete_user(db, user_id=user_id)
    return


@router.post("/{user_id}/follow", status_code=201)
def follow_user(user_id: str, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    crud.follow_user(db, follower_id=current_user.user_id, following_id=user_id)
    return {"detail": "followed"}


@router.post("/{user_id}/unfollow", status_code=200)
def unfollow_user(user_id: str, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.unfollow_user(db, follower_id=current_user.user_id, following_id=user_id)
    return {"detail": "unfollowed"}


@router.get("/{user_id}/followers", response_model=List[dict])
def list_followers(
    user_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        text("SELECT follower_id FROM user_follows WHERE following_id = :uid ORDER BY created_at DESC LIMIT :lim OFFSET :off"),
        {"uid": user_id, "lim": per_page, "off": (page - 1) * per_page},
    ).fetchall()
    follower_ids = [r[0] for r in rows]
    users = db.query(models.User).filter(models.User.user_id.in_(follower_ids)).all() if follower_ids else []
    user_map = {u.user_id: {"user_id": u.user_id, "nickname": u.nickname, "avatar": u.avatar} for u in users}
    return [user_map.get(uid, {"user_id": uid}) for uid in follower_ids]


@router.get("/{user_id}/following", response_model=List[dict])
def list_following(
    user_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        text("SELECT following_id FROM user_follows WHERE follower_id = :uid ORDER BY created_at DESC LIMIT :lim OFFSET :off"),
        {"uid": user_id, "lim": per_page, "off": (page - 1) * per_page},
    ).fetchall()
    following_ids = [r[0] for r in rows]
    users = db.query(models.User).filter(models.User.user_id.in_(following_ids)).all() if following_ids else []
    user_map = {u.user_id: {"user_id": u.user_id, "nickname": u.nickname, "avatar": u.avatar} for u in users}
    return [user_map.get(uid, {"user_id": uid}) for uid in following_ids]


@router.get("/{user_id}/stats", response_model=dict)
def get_user_stats(user_id: str, db: Session = Depends(get_db)):
    follower_count = db.execute(text("SELECT COUNT(*) FROM user_follows WHERE following_id = :uid"), {"uid": user_id}).scalar() or 0
    following_count = db.execute(text("SELECT COUNT(*) FROM user_follows WHERE follower_id = :uid"), {"uid": user_id}).scalar() or 0
    post_count = db.query(models.Post).filter(models.Post.user_id == user_id, models.Post.is_deleted == False).count()
    return {"followers": follower_count, "following": following_count, "posts": post_count}
