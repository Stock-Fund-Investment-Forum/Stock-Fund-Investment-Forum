from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, auth
from app.database import get_db
from app.schemas import MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[dict])
def list_conversations(current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    from app.models import Message, User
    all_msgs = (
        db.query(Message)
        .filter(
            (Message.sender_id == current_user.user_id) | (Message.recipient_id == current_user.user_id)
        )
        .order_by(Message.created_at.desc())
        .all()
    )
    seen = set()
    partner_ids = []
    for msg in all_msgs:
        other = msg.recipient_id if msg.sender_id == current_user.user_id else msg.sender_id
        if other not in seen:
            seen.add(other)
            partner_ids.append(other)

    result = []
    for pid in partner_ids:
        partner = db.query(User).filter(User.user_id == pid).first()
        if not partner:
            continue
        last_msg = (
            db.query(Message)
            .filter(
                ((Message.sender_id == current_user.user_id) & (Message.recipient_id == pid))
                | ((Message.sender_id == pid) & (Message.recipient_id == current_user.user_id))
            )
            .order_by(Message.created_at.desc())
            .first()
        )
        unread = crud.count_unread_messages(db, current_user.user_id)
        result.append({
            "partner_id": pid,
            "partner_nickname": partner.nickname,
            "partner_avatar": partner.avatar,
            "last_message": last_msg.content if last_msg else "",
            "last_time": last_msg.created_at.isoformat() if last_msg else None,
            "unread_count": unread,
        })

    return result


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
