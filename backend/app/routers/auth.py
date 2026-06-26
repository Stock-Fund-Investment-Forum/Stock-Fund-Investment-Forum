from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app import crud, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.email:
        existing = crud.get_user_by_email(db, email=user.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    if user.phone:
        existing_phone = crud.get_user_by_phone(db, phone=user.phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone already registered")

    existing_nickname = crud.get_user_by_nickname(db, nickname=user.nickname)
    if existing_nickname:
        raise HTTPException(status_code=400, detail="Nickname already taken")

    try:
        db_user = crud.create_user(db, user=user)
    except IntegrityError as e:
        db.rollback()
        err_msg = str(e.orig).lower() if e.orig else ""
        if "email" in err_msg or "unique" in err_msg:
            raise HTTPException(status_code=400, detail="Email or nickname already exists")
        raise HTTPException(status_code=400, detail="Registration failed, please try again")
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        user = crud.get_user_by_phone(db, phone=form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials"
        )
    access_token = auth.create_access_token(data={"sub": user.user_id})
    return {"access_token": access_token, "token_type": "bearer"}
