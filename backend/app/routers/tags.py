from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[schemas.TagOut])
def list_tags(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    is_hot: bool = Query(None),
    db: Session = Depends(get_db),
):
    """获取标签列表"""
    skip = (page - 1) * per_page
    tags = crud.get_tags(
        db, skip=skip, limit=per_page, category=category, is_hot=is_hot
    )
    return tags


@router.get("/{tag_id}", response_model=schemas.TagOut)
def get_tag(tag_id: str, db: Session = Depends(get_db)):
    """获取标签详情"""
    tag = crud.get_tag(db, tag_id)
    if not tag:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Tag not found")
    return tag
