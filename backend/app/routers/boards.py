from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/boards", tags=["boards"])


@router.get("", response_model=List[schemas.BoardOut])
def list_boards(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    db: Session = Depends(get_db),
):
    """获取板块列表"""
    skip = (page - 1) * per_page
    try:
        boards = crud.get_boards(db, skip=skip, limit=per_page, category=category)
        return boards
    except Exception as e:
        import logging

        logging.exception("Failed to list boards")
        # 在开发环境把异常信息返回，便于调试（生产请改为通用错误）
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{board_id}", response_model=schemas.BoardOut)
def get_board(board_id: str, db: Session = Depends(get_db)):
    """获取板块详情"""
    board = crud.get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


@router.post("", response_model=schemas.BoardOut, status_code=201)
def create_board(
    board: schemas.BoardCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """创建板块（仅管理员）"""
    # TODO: 检查管理员权限
    db_board = crud.create_board(db, board)
    return db_board


@router.put("/{board_id}", response_model=schemas.BoardOut)
def update_board(
    board_id: str,
    board: schemas.BoardCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """更新板块（仅管理员）"""
    # TODO: 检查管理员权限
    db_board = crud.update_board(db, board_id, board)
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    return db_board


@router.post("/{board_id}/subscribe", status_code=200)
def subscribe_board(
    board_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """订阅板块"""
    board = crud.get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    subscription = crud.subscribe_board(db, current_user.user_id, board_id)
    return {"message": "Subscribed successfully", "board_id": board_id}


@router.post("/{board_id}/unsubscribe", status_code=200)
def unsubscribe_board(
    board_id: str,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """取消订阅板块"""
    board = crud.get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    subscription = crud.unsubscribe_board(db, current_user.user_id, board_id)
    return {"message": "Unsubscribed successfully", "board_id": board_id}
