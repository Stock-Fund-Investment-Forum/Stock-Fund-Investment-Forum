from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter(prefix="/comments", tags=["comments"])


def enrich_comments_with_nicknames(db: Session, comments):
    user_ids = list(set(c.user_id for c in comments if c.user_id))
    if not user_ids:
        return comments
    users = db.query(models.User).filter(models.User.user_id.in_(user_ids)).all()
    user_map = {u.user_id: u.nickname for u in users}
    for c in comments:
        c.user_nickname = user_map.get(c.user_id, c.user_id[:8])
    return comments


@router.get("", response_model=List[schemas.CommentOut])
def list_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    parent_comment_id: str = Query(None),
    db: Session = Depends(get_db),
):
    """获取评论列表"""
    if parent_comment_id == "":
        parent_comment_id = None

    # 检查帖子是否存在
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    skip = (page - 1) * per_page
    comments = crud.get_comments(
        db,
        post_id=post_id,
        skip=skip,
        limit=per_page,
        parent_comment_id=parent_comment_id,
    )
    return enrich_comments_with_nicknames(db, comments)


@router.get("/{comment_id}", response_model=schemas.CommentOut)
def get_comment(comment_id: str, db: Session = Depends(get_db)):
    """获取评论详情"""
    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.post("", response_model=schemas.CommentOut, status_code=201)
def create_comment(
    comment: schemas.CommentCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """创建评论"""
    if comment.parent_comment_id == "":
        comment.parent_comment_id = None

    # 检查帖子是否存在
    post = crud.get_post(db, comment.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 如果有父评论，检查是否存在
    if comment.parent_comment_id:
        parent_comment = crud.get_comment(db, comment.parent_comment_id)
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        # 检查父评论是否属于同一帖子
        if parent_comment.post_id != comment.post_id:
            raise HTTPException(
                status_code=400, detail="Parent comment not in the same post"
            )

    db_comment = crud.create_comment(db, comment, current_user.user_id)
    return db_comment


@router.put("/{comment_id}", response_model=schemas.CommentOut)
def update_comment(
    comment_id: str,
    comment: schemas.CommentUpdate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """更新评论"""
    db_comment = crud.get_comment(db, comment_id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # 检查权限（只能更新自己的评论）
    if db_comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    updated_comment = crud.update_comment(db, comment_id, comment)
    return updated_comment


@router.delete("/{comment_id}", status_code=200)
def delete_comment(
    comment_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """删除评论（软删除）"""
    db_comment = crud.get_comment(db, comment_id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # 检查权限（只能删除自己的评论）
    if db_comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    crud.delete_comment(db, comment_id)
    return {"message": "Comment deleted successfully"}


@router.post("/{comment_id}/like", status_code=200)
def like_comment(
    comment_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """点赞评论"""
    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # 检查是否已点赞
    engagement = crud.get_engagement(db, current_user.user_id, comment_id, "LIKE")
    if engagement:
        raise HTTPException(status_code=400, detail="Already liked")

    # 创建点赞记录
    crud.create_or_update_engagement(
        db,
        current_user.user_id,
        comment_id,
        "COMMENT",
        "LIKE",
    )

    # 增加点赞数
    crud.increment_comment_like(db, comment_id)

    return {"message": "Comment liked successfully"}


@router.post("/{comment_id}/unlike", status_code=200)
def unlike_comment(
    comment_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """取消点赞评论"""
    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    # 检查是否已点赞；如果没有点赞，保持幂等，返回 200
    engagement = crud.get_engagement(db, current_user.user_id, comment_id, "LIKE")
    if not engagement:
        return {"message": "Comment not liked"}

    # 删除点赞记录
    crud.remove_engagement(db, current_user.user_id, comment_id, "LIKE")

    # 减少点赞数
    comment = crud.get_comment(db, comment_id)
    if comment and comment.like_count > 0:
        comment.like_count -= 1
        db.commit()

    return {"message": "Comment unliked successfully"}
