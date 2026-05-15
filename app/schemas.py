from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    nickname: str
    email: EmailStr
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    auth_level: Optional[str]
    status: Optional[str]
    level: Optional[int]
    points: Optional[int]
    influence_value: Optional[float]
    is_deleted: Optional[bool]
    created_at: Optional[datetime]


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
