from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email, models.User.is_deleted == False)
        .first()
    )


def get_user_by_nickname(db: Session, nickname: str):
    return (
        db.query(models.User)
        .filter(models.User.nickname == nickname, models.User.is_deleted == False)
        .first()
    )


def get_user(db: Session, user_id: str):
    return (
        db.query(models.User)
        .filter(models.User.user_id == user_id, models.User.is_deleted == False)
        .first()
    )


def create_user(db: Session, user: schemas.UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = models.User(
        nickname=user.nickname,
        email=user.email,
        phone=user.phone,
        avatar=user.avatar,
        bio=user.bio,
        hashed_password=hashed,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
