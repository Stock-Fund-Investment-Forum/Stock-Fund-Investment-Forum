from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, auth
from app.database import get_db
from app.schemas import NotificationOut, NotificationCreate

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(page: int = Query(1, ge=1), per_page: int = Query(50, ge=1, le=200), current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    items = crud.list_notifications(db, user_id=current_user.user_id, page=page, per_page=per_page)
    # serialize ORM objects to plain dicts so response validation passes (convert enums)
    out = []
    for n in items:
        t = n.type.value if hasattr(n.type, "value") else n.type
        out.append({
            "notification_id": n.notification_id,
            "user_id": n.user_id,
            "type": t,
            "content": n.content,
            "is_read": bool(n.is_read),
            "created_at": n.created_at,
        })
    return out


@router.post("/mark_read", status_code=200)
def mark_read(notification_id: str | None = None, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.mark_notifications_read(db, user_id=current_user.user_id, notification_id=notification_id)
    return {"detail": "marked"}


@router.get("/unread_count")
def unread_count(current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    cnt = crud.count_unread_notifications(db, user_id=current_user.user_id)
    return {"unread": cnt}


@router.post("", status_code=201, response_model=NotificationOut)
def create_notification(n: NotificationCreate, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # only allow system/admin to create notifications in real app; here simple
    notif = crud.create_notification(db, user_id=n.user_id, type=n.type, content=n.content)
    t = notif.type.value if hasattr(notif.type, "value") else notif.type
    return {
        "notification_id": notif.notification_id,
        "user_id": notif.user_id,
        "type": t,
        "content": notif.content,
        "is_read": bool(notif.is_read),
        "created_at": notif.created_at,
    }
