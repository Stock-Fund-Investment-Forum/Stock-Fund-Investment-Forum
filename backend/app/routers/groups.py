from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
import os, uuid

from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("", response_model=List[schemas.GroupOut])
def list_groups(
    q: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Optional[object] = Depends(auth.get_optional_user),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page
    groups = crud.get_groups(db, query=q, skip=skip, limit=per_page)
    
    # 动态设置 is_owner, is_admin, is_member 字段
    result = []
    for group in groups:
        group_dict = {
            "group_id": group.group_id,
            "name": group.name,
            "description": group.description,
            "access_level": group.access_level,
            "owner_id": group.owner_id,
            "member_count": group.member_count or 0,
            "post_count": group.post_count or 0,
            "file_count": group.file_count or 0,
            "created_at": group.created_at,
            "updated_at": group.updated_at,
            "is_owner": False,
            "is_admin": False,
            "is_member": False,
            "unread_count": 0
        }
        
        # 如果用户已登录，检查其在该群组的角色
        if current_user:
            membership = crud.get_group_membership(db, group.group_id, current_user.user_id)
            if membership:
                group_dict["is_member"] = True
                if membership.role == "OWNER":
                    group_dict["is_owner"] = True
                    group_dict["is_admin"] = True
                elif membership.role == "ADMIN":
                    group_dict["is_admin"] = True
        
        result.append(schemas.GroupOut(**group_dict))
    
    return result


@router.get("/{group_id}", response_model=schemas.GroupOut)
def get_group(
    group_id: str,
    current_user: Optional[object] = Depends(auth.get_optional_user),
    db: Session = Depends(get_db)
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # 动态设置 is_owner, is_admin, is_member 字段
    group_dict = {
        "group_id": group.group_id,
        "name": group.name,
        "description": group.description,
        "access_level": group.access_level,
        "owner_id": group.owner_id,
        "member_count": group.member_count or 0,
        "post_count": group.post_count or 0,
        "file_count": group.file_count or 0,
        "created_at": group.created_at,
        "updated_at": group.updated_at,
        "is_owner": False,
        "is_admin": False,
        "is_member": False,
        "unread_count": 0
    }
    
    # 如果用户已登录，检查其在该群组的角色
    if current_user:
        membership = crud.get_group_membership(db, group_id, current_user.user_id)
        if membership:
            group_dict["is_member"] = True
            if membership.role == "OWNER":
                group_dict["is_owner"] = True
                group_dict["is_admin"] = True
            elif membership.role == "ADMIN":
                group_dict["is_admin"] = True
    
    return schemas.GroupOut(**group_dict)


@router.post("", response_model=schemas.GroupOut, status_code=201)
def create_group(
    group: schemas.GroupCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db_group = crud.create_group(db, group, current_user.user_id)
    return db_group


@router.post("/{group_id}/join", status_code=200)
def join_group(
    group_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    crud.join_group(db, current_user.user_id, group_id)
    return {"message": "Joined group successfully"}


@router.post("/{group_id}/leave", status_code=200)
def leave_group(
    group_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    crud.leave_group(db, current_user.user_id, group_id)
    return {"message": "Left group successfully"}


upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "group_files")
os.makedirs(upload_dir, exist_ok=True)


@router.post("/{group_id}/files", status_code=201)
def upload_group_file(
    group_id: str,
    file: UploadFile = File(...),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    membership = crud.get_group_membership(db, group_id, current_user.user_id)
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    saved_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, saved_name)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    attachment = models.Attachment(
        post_id=group_id, user_id=current_user.user_id,
        filename=file.filename, file_path=file_path,
        file_type=ext.lstrip("."), file_size=os.path.getsize(file_path),
    )
    db.add(attachment)
    if group.file_count is not None:
        group.file_count += 1
    db.commit()
    return {"detail": "File uploaded", "file_id": attachment.attachment_id, "filename": file.filename}


@router.get("/{group_id}/members", response_model=List[dict])
def list_group_members(
    group_id: str,
    db: Session = Depends(get_db),
):
    from app.models import GroupMembership, User
    memberships = db.query(GroupMembership).filter(GroupMembership.group_id == group_id).all()
    user_ids = [m.user_id for m in memberships]
    users = db.query(User).filter(User.user_id.in_(user_ids)).all() if user_ids else []
    user_map = {u.user_id: u for u in users}
    role_map = {m.user_id: m.role for m in memberships}
    return [
        {
            "user_id": uid,
            "nickname": user_map[uid].nickname if uid in user_map else uid[:8],
            "avatar": user_map[uid].avatar if uid in user_map else None,
            "role": role_map.get(uid, "MEMBER"),
            "joined_at": next((m.joined_at.isoformat() for m in memberships if m.user_id == uid), None),
        }
        for uid in user_ids
    ]


@router.get("/{group_id}/polls", response_model=List[dict])
def list_group_polls(
    group_id: str,
    current_user=Depends(auth.get_optional_user),
    db: Session = Depends(get_db),
):
    from app.models import Post, Poll, PollOption, PollVote
    posts = db.query(Post).filter(Post.board_id == group_id, Post.is_deleted == False).all()
    post_ids = [p.post_id for p in posts]
    if not post_ids:
        return []
    polls = db.query(Poll).filter(Poll.post_id.in_(post_ids)).all()
    if not polls:
        return []
    poll_ids = [p.poll_id for p in polls]
    options = db.query(PollOption).filter(PollOption.poll_id.in_(poll_ids)).order_by(PollOption.display_order).all()
    opt_map = {}
    for opt in options:
        opt_map.setdefault(opt.poll_id, []).append({
            "option_id": opt.option_id,
            "text": opt.text,
            "vote_count": opt.vote_count or 0,
        })
    result = []
    for p in polls:
        user_votes = []
        if current_user:
            user_votes = db.query(PollVote).filter(
                PollVote.poll_id == p.poll_id, PollVote.user_id == current_user.user_id
            ).all()
        voted_option_ids = set(v.option_id for v in user_votes)
        result.append({
            "poll_id": p.poll_id,
            "post_id": p.post_id,
            "question": p.question,
            "total_votes": p.total_votes or 0,
            "allow_multiple": p.allow_multiple or False,
            "status": p.status or "ACTIVE",
            "end_time": p.end_time.isoformat() if p.end_time else None,
            "options": opt_map.get(p.poll_id, []),
            "voted_option_ids": list(voted_option_ids),
            "has_voted": len(voted_option_ids) > 0,
        })
    return result


@router.get("/{group_id}/files", response_model=List[dict])
def list_group_files(
    group_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    from app.models import Attachment, User
    skip = (page - 1) * per_page
    attachments = (
        db.query(Attachment)
        .filter(Attachment.post_id == group_id, Attachment.is_deleted == False)
        .order_by(Attachment.created_at.desc())
        .offset(skip).limit(per_page)
        .all()
    )
    user_ids = list(set(a.user_id for a in attachments))
    users = db.query(User).filter(User.user_id.in_(user_ids)).all() if user_ids else []
    user_map = {u.user_id: u.nickname for u in users}
    return [
        {
            "file_id": a.attachment_id,
            "filename": a.filename,
            "file_type": a.file_type,
            "file_size": a.file_size,
            "user_id": a.user_id,
            "user_nickname": user_map.get(a.user_id, a.user_id[:8]),
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in attachments
    ]