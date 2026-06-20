from fastapi import APIRouter, Depends, HTTPException, Query
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


@router.get("", status_code=200)
def get_engagement(
    content_id: str = Query(...),
    content_type: str = Query(...),
    engagement_type: str = Query(...),
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    eng = crud.get_engagement(db, current_user.user_id, content_id, engagement_type)
    if eng and eng.content_type == content_type:
        return {"exists": True, "engagement_id": eng.engagement_id}
    return {"exists": False}


@router.delete("", status_code=200)
def delete_engagement(e: EngagementIn, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.remove_engagement(db, user_id=current_user.user_id, content_id=e.content_id, engagement_type=e.engagement_type)
    return {"detail": "removed"}
