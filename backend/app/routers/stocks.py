from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("", response_model=List[schemas.StockInfoOut])
def list_stocks(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    q: str = Query(None),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page
    if q:
        from ..models import StockInfo
        like = f"%{q}%"
        return db.query(StockInfo).filter(
            StockInfo.name.ilike(like) | StockInfo.symbol.ilike(like)
        ).offset(skip).limit(per_page).all()
    return crud.list_stocks(db, skip=skip, limit=per_page)


@router.get("/{stock_id}", response_model=schemas.StockInfoOut)
def get_stock(stock_id: str, db: Session = Depends(get_db)):
    s = crud.get_stock(db, stock_id)
    if not s:
        raise HTTPException(status_code=404, detail="Stock not found")
    return s


@router.post("", response_model=schemas.StockInfoOut, status_code=201)
def create_stock(
    stock: schemas.StockInfoCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # TODO: permission check for updating stocks
    s = crud.create_or_update_stock(db, stock)
    return s


@router.patch("/{stock_id}", response_model=schemas.StockInfoOut)
def update_stock(
    stock_id: str,
    stock: schemas.StockInfoUpdate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # permission check TODO
    try:
        s = crud.update_stock(db, stock_id, stock)
    except Exception as e:
        # 打印堆栈以便在服务端日志看到具体错误（开发时使用）
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

    if not s:
        raise HTTPException(status_code=404, detail="Stock not found")
    return s


@router.get(
    "/{stock_id}/discussions", response_model=List[schemas.RealtimeDiscussionOut]
)
def get_discussions(
    stock_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * per_page
    return crud.get_realtime_discussions(
        db, stock_id=stock_id, skip=skip, limit=per_page
    )


@router.post(
    "/{stock_id}/discussions",
    response_model=schemas.RealtimeDiscussionOut,
    status_code=201,
)
def create_discussion(
    stock_id: str,
    disc: schemas.RealtimeDiscussionCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # ensure stock exists (optional)
    stock = crud.get_stock(db, stock_id)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    disc.stock_id = stock_id
    return crud.create_realtime_discussion(db, disc, current_user.user_id)
