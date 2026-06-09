from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[schemas.UserOut])
def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * per_page
    users = (
        db.query(crud.models.User)
        .filter(crud.models.User.is_deleted == False)
        .offset(offset)
        .limit(per_page)
        .all()
    )
    return users


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user=Depends(auth.get_current_user)):
    return current_user


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
