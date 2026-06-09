from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, auth
from app.database import get_db
from app.schemas import EngagementIn

router = APIRouter(prefix="/engagements", tags=["engagements"])


@router.post("", status_code=201)
def create_engagement(e: EngagementIn, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    created = crud.add_engagement(db, user_id=current_user.user_id, content_id=e.content_id, content_type=e.content_type, engagement_type=e.engagement_type)
    if not created:
        raise HTTPException(status_code=400, detail="Already exists")
    return {"detail": "created"}


@router.delete("", status_code=200)
def delete_engagement(e: EngagementIn, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.remove_engagement(db, user_id=current_user.user_id, content_id=e.content_id, engagement_type=e.engagement_type)
    return {"detail": "removed"}
