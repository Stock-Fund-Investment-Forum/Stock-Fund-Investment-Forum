import enum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic import field_validator
from datetime import datetime


class BoardCategory(str, enum.Enum):
    GENERAL = "GENERAL"
    STOCKS = "STOCKS"
    FUNDS = "FUNDS"
    ANALYSIS = "ANALYSIS"
    NEWS = "NEWS"
    QUESTIONS = "QUESTIONS"
    STRATEGIES = "STRATEGIES"


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


# =====================================================
# 社区内容 Schemas
# =====================================================


class BoardBase(BaseModel):
    name: str
    category: Optional[BoardCategory] = None
    description: Optional[str] = None


class BoardCreate(BoardBase):
    pass


class BoardOut(BoardBase):
    model_config = ConfigDict(from_attributes=True)

    board_id: str
    post_count: int = 0
    member_count: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class TagBase(BaseModel):
    name: str
    category: str


class TagCreate(TagBase):
    pass


class TagOut(TagBase):
    model_config = ConfigDict(from_attributes=True)

    tag_id: str
    usage_count: int = 0
    is_hot: bool = False
    created_at: datetime
    updated_at: datetime


class PostBase(BaseModel):
    title: str
    content: str

    class PostType(str, enum.Enum):
        QUESTION = "QUESTION"
        DISCUSSION = "DISCUSSION"
        ANALYSIS = "ANALYSIS"
        NEWS = "NEWS"
        GUIDE = "GUIDE"

    post_type: Optional[PostType] = PostType.DISCUSSION


class PostCreate(PostBase):
    board_id: str
    tags: Optional[List[str]] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    class PostStatus(str, enum.Enum):
        DRAFT = "DRAFT"
        PUBLISHED = "PUBLISHED"
        ARCHIVED = "ARCHIVED"
        DELETED = "DELETED"

    status: Optional[PostStatus] = None


class PostOut(PostBase):
    model_config = ConfigDict(from_attributes=True)

    post_id: str
    user_id: str
    board_id: str
    status: str = "PUBLISHED"
    audit_status: str = "APPROVED"
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    is_essence: bool = False
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime
    tags: Optional[List[TagOut]] = None


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    post_id: str
    parent_comment_id: Optional[str] = None

    @field_validator("parent_comment_id", mode="before")
    @classmethod
    def empty_parent_comment_id_to_none(cls, value):
        if value == "":
            return None
        return value


class CommentUpdate(BaseModel):
    content: Optional[str] = None


class CommentOut(CommentBase):
    model_config = ConfigDict(from_attributes=True)

    comment_id: str
    post_id: str
    parent_comment_id: Optional[str] = None
    user_id: str
    audit_status: str = "APPROVED"
    like_count: int = 0
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime


# Stocks / Realtime / Audit Schemas


class StockInfoBase(BaseModel):
    symbol: str
    name: Optional[str] = None


class StockInfoCreate(StockInfoBase):
    last_price: Optional[float] = 0
    change: Optional[float] = 0
    percent_change: Optional[float] = 0
    volume: Optional[float] = 0
    market_time: Optional[datetime] = None


class StockInfoOut(StockInfoBase):
    model_config = ConfigDict(from_attributes=True)

    stock_id: str
    last_price: Optional[float] = 0
    change: Optional[float] = 0
    percent_change: Optional[float] = 0
    volume: Optional[float] = 0
    market_time: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class StockInfoUpdate(BaseModel):
    name: Optional[str] = None
    last_price: Optional[float] = None
    change: Optional[float] = None
    percent_change: Optional[float] = None
    volume: Optional[float] = None
    market_time: Optional[datetime] = None


class RealtimeDiscussionCreate(BaseModel):
    stock_id: Optional[str] = None
    content: str


class RealtimeDiscussionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    discussion_id: str
    stock_id: Optional[str] = None
    user_id: str
    content: str
    created_at: datetime


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audit_id: str
    actor_id: Optional[str]
    target_type: str
    target_id: str
    action: str
    details: Optional[str]
    created_at: datetime


class ViolationCreate(BaseModel):
    target_type: str
    target_id: str
    reason: str


class ViolationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    violation_id: str
    target_type: str
    target_id: str
    reporter_id: Optional[str]
    reason: Optional[str]
    status: str
    resolved_by: Optional[str]
    resolved_at: Optional[datetime]
    created_at: datetime
