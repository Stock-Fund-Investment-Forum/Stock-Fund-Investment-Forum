from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, auth
from app.database import get_db
from app.schemas import MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("", response_model=MessageOut, status_code=201)
def send_message(m: MessageCreate, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # ensure recipient exists
    from app.models import User

    recipient = db.query(User).filter(User.user_id == m.recipient_id, User.is_deleted == False).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    msg = crud.send_message(db, sender_id=current_user.user_id, recipient_id=m.recipient_id, content=m.content)
    # create a notification for recipient
    crud.create_notification(db, user_id=m.recipient_id, type="MESSAGE", content=f"New message from {current_user.nickname}")
    return msg


@router.get("/conversations/{other_user_id}", response_model=list[MessageOut])
def get_conversation(other_user_id: str, page: int = Query(1, ge=1), per_page: int = Query(50, ge=1, le=200), current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    msgs = crud.get_conversation_messages(db, user_id=current_user.user_id, other_user_id=other_user_id, page=page, per_page=per_page)
    return msgs


@router.post("/mark_read", status_code=200)
def mark_read(sender_id: str | None = None, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.mark_messages_read(db, recipient_id=current_user.user_id, sender_id=sender_id)
    return {"detail": "marked"}


@router.get("/unread_count")
def unread_count(current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    cnt = crud.count_unread_messages(db, user_id=current_user.user_id)
    return {"unread": cnt}
