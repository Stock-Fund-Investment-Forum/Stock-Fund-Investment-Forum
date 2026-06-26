from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, auth
from app.database import get_db
from app.schemas import PollCreate, PollOut, PollVoteIn

router = APIRouter(prefix="/polls", tags=["polls"])


@router.post("", response_model=PollOut, status_code=201)
def create_poll(poll_in: PollCreate, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    poll = crud.create_poll(db, poll_in)
    # return poll with options
    poll_with_opts = crud.get_poll_with_options(db, poll.poll_id)
    return poll_with_opts


@router.post("/{poll_id}/vote")
def vote(poll_id: str, vote_in: PollVoteIn, current_user=Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # basic check - option belongs to poll omitted for brevity
    res = crud.vote_poll(db, user_id=current_user.user_id, poll_id=poll_id, option_id=vote_in.option_id)
    if res is None:
        raise HTTPException(status_code=404, detail="Option or poll not found")
    if res is False:
        raise HTTPException(status_code=400, detail="Already voted")
    return {"detail": "voted"}



@router.get("/{poll_id}", response_model=PollOut)
def get_poll(poll_id: str, db: Session = Depends(get_db)):
    poll = crud.get_poll_with_options(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Not found")
    return poll
