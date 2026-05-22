from typing import List
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=List[schemas.PostOut])
def list_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    board_id: str = Query(None),
    user_id: str = Query(None),
    post_type: str = Query(None),
    tag_id: str = Query(None),
    include_deleted: bool = Query(False),
    order_by: str = Query("created_at"),  # 'hot' or 'created_at'
    db: Session = Depends(get_db),
):
    """获取帖子列表"""
    skip = (page - 1) * per_page
    posts = crud.get_posts(
        db,
        skip=skip,
        limit=per_page,
        board_id=board_id,
        user_id=user_id,
        post_type=post_type,
        tag_id=tag_id,
        include_deleted=include_deleted,
        order_by=order_by,
    )
    return posts


@router.get("/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: str, db: Session = Depends(get_db)):
    """获取帖子详情，同时增加浏览次数"""
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 增加浏览次数
    crud.increment_post_view(db, post_id)

    return post


@router.post("", response_model=schemas.PostOut, status_code=201)
def create_post(
    post: schemas.PostCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """创建帖子"""
    # 检查板块是否存在
    board = crud.get_board(db, post.board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    db_post = crud.create_post(db, post, current_user.user_id)
    return db_post


@router.put("/{post_id}", response_model=schemas.PostOut)
def update_post(
    post_id: str,
    post: schemas.PostUpdate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """更新帖子"""
    db_post = crud.get_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 检查权限（只能更新自己的帖子）
    if db_post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        updated_post = crud.update_post(db, post_id, post)
        return updated_post
    except Exception as e:
        logging.exception("Failed to update post %s", post_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{post_id}", status_code=200)
def delete_post(
    post_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """删除帖子（软删除）"""
    db_post = crud.get_post(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 检查权限（只能删除自己的帖子）
    if db_post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    crud.delete_post(db, post_id)
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like", status_code=200)
def like_post(
    post_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """点赞帖子"""
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 检查是否已点赞
    engagement = crud.get_engagement(db, current_user.user_id, post_id, "LIKE")
    if engagement:
        raise HTTPException(status_code=400, detail="Already liked")

    # 创建点赞记录
    crud.create_or_update_engagement(
        db,
        current_user.user_id,
        post_id,
        "POST",
        "LIKE",
    )

    # 增加点赞数
    crud.increment_post_like(db, post_id)

    return {"message": "Post liked successfully"}


@router.post("/{post_id}/unlike", status_code=200)
def unlike_post(
    post_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """取消点赞帖子"""
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 检查是否已点赞
    engagement = crud.get_engagement(db, current_user.user_id, post_id, "LIKE")
    if engagement:
        # 删除点赞记录
        crud.remove_engagement(db, current_user.user_id, post_id, "LIKE")

        # 减少点赞数
        post = crud.get_post(db, post_id)
        if post and post.like_count > 0:
            post.like_count -= 1
            db.commit()

        return {"message": "Post unliked successfully"}

    # 幂等：没点过赞也视为取消成功
    return {"message": "Post was not liked, nothing to unlike"}
