import enum
import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    DECIMAL,
    Text,
    Enum as SAEnum,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# use generic SQLAlchemy Enum for cross-db compatibility
from .database import Base


class AuthLevel(enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    EMAIL_VERIFIED = "EMAIL_VERIFIED"
    PHONE_VERIFIED = "PHONE_VERIFIED"
    REAL_NAME_VERIFIED = "REAL_NAME_VERIFIED"
    EXPERT = "EXPERT"


class UserStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    BANNED = "BANNED"


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nickname = Column(String(50), nullable=False, unique=True)
    email = Column(String(120), nullable=False, unique=True)
    phone = Column(String(20))
    avatar = Column(String(255))
    bio = Column(Text)
    hashed_password = Column(String(255), nullable=False)
    auth_level = Column(
        SAEnum(
            AuthLevel,
            values_callable=lambda x: [e.value for e in AuthLevel],
            native_enum=False,
        ),
        default=AuthLevel.UNVERIFIED,
    )
    status = Column(
        SAEnum(
            UserStatus,
            values_callable=lambda x: [e.value for e in UserStatus],
            native_enum=False,
        ),
        default=UserStatus.ACTIVE,
    )
    level = Column(Integer, default=1)
    points = Column(Integer, default=0)
    influence_value = Column(DECIMAL(10, 2), default=0.00)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# =====================================================
# 社区内容模型
# =====================================================


class BoardCategory(enum.Enum):
    GENERAL = "GENERAL"
    STOCKS = "STOCKS"
    FUNDS = "FUNDS"
    ANALYSIS = "ANALYSIS"
    NEWS = "NEWS"
    QUESTIONS = "QUESTIONS"
    STRATEGIES = "STRATEGIES"


class Board(Base):
    __tablename__ = "boards"

    board_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    category = Column(
        SAEnum(
            BoardCategory,
            values_callable=lambda x: [e.value for e in BoardCategory],
            native_enum=False,
        ),
        nullable=True,
    )
    description = Column(Text)
    post_count = Column(Integer, default=0)
    member_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class TagCategory(enum.Enum):
    STOCK = "STOCK"
    FUND = "FUND"
    STRATEGY = "STRATEGY"
    ANALYSIS = "ANALYSIS"
    NEWS = "NEWS"
    OTHER = "OTHER"


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False)
    category = Column(
        SAEnum(
            TagCategory,
            values_callable=lambda x: [e.value for e in TagCategory],
            native_enum=False,
        ),
        nullable=False,
    )
    usage_count = Column(Integer, default=0)
    is_hot = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PostType(enum.Enum):
    QUESTION = "QUESTION"
    DISCUSSION = "DISCUSSION"
    ANALYSIS = "ANALYSIS"
    NEWS = "NEWS"
    GUIDE = "GUIDE"


class PostStatus(enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"


class AuditStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FLAGGED = "FLAGGED"


class Post(Base):
    __tablename__ = "posts"

    post_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    board_id = Column(
        String(36), ForeignKey("boards.board_id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    post_type = Column(
        SAEnum(
            PostType,
            values_callable=lambda x: [e.value for e in PostType],
            native_enum=False,
        ),
        default=PostType.DISCUSSION,
    )
    status = Column(
        SAEnum(
            PostStatus,
            values_callable=lambda x: [e.value for e in PostStatus],
            native_enum=False,
        ),
        default=PostStatus.PUBLISHED,
    )
    audit_status = Column(
        SAEnum(
            AuditStatus,
            values_callable=lambda x: [e.value for e in AuditStatus],
            native_enum=False,
        ),
        default=AuditStatus.APPROVED,
    )
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    is_essence = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ORM relationship to tags through association table
    tags = relationship("Tag", secondary="post_tags", backref="posts")


class PostTag(Base):
    __tablename__ = "post_tags"

    post_id = Column(
        String(36), ForeignKey("posts.post_id", ondelete="CASCADE"), primary_key=True
    )
    tag_id = Column(
        String(36), ForeignKey("tags.tag_id", ondelete="CASCADE"), primary_key=True
    )


class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(
        String(36), ForeignKey("posts.post_id", ondelete="CASCADE"), nullable=False
    )
    parent_comment_id = Column(
        String(36), ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=True
    )
    user_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    content = Column(Text, nullable=False)
    audit_status = Column(
        SAEnum(
            AuditStatus,
            values_callable=lambda x: [e.value for e in AuditStatus],
            native_enum=False,
        ),
        default=AuditStatus.APPROVED,
    )
    like_count = Column(Integer, default=0)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class BoardSubscription(Base):
    __tablename__ = "board_subscriptions"

    user_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True
    )
    board_id = Column(
        String(36), ForeignKey("boards.board_id", ondelete="CASCADE"), primary_key=True
    )
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())


class EngagementType(enum.Enum):
    LIKE = "LIKE"
    SHARE = "SHARE"
    REPORT = "REPORT"
    BOOKMARK = "BOOKMARK"


class ContentType(enum.Enum):
    POST = "POST"
    COMMENT = "COMMENT"
    STOCK_INFO = "STOCK_INFO"


class Engagement(Base):
    __tablename__ = "engagements"

    engagement_id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    content_id = Column(String(36), nullable=False)
    content_type = Column(
        SAEnum(
            ContentType,
            values_callable=lambda x: [e.value for e in ContentType],
            native_enum=False,
        ),
        nullable=False,
    )
    engagement_type = Column(
        SAEnum(
            EngagementType,
            values_callable=lambda x: [e.value for e in EngagementType],
            native_enum=False,
        ),
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# =====================================================
# Stocks / Realtime / Audit Models
# =====================================================


class StockInfo(Base):
    __tablename__ = "stock_infos"

    stock_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol = Column(String(32), nullable=False, unique=True)
    name = Column(String(200))
    last_price = Column(DECIMAL(18, 6), default=0)
    change = Column(DECIMAL(18, 6), default=0)
    percent_change = Column(DECIMAL(10, 4), default=0)
    volume = Column(DECIMAL(20, 2), default=0)
    market_time = Column(DateTime(timezone=True))
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class RealtimeDiscussion(Base):
    __tablename__ = "realtime_discussions"

    discussion_id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    stock_id = Column(
        String(36),
        ForeignKey("stock_infos.stock_id", ondelete="CASCADE"),
        nullable=True,
    )
    user_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(36), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Violation(Base):
    __tablename__ = "violations"

    violation_id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(36), nullable=False)
    reporter_id = Column(
        String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )
    reason = Column(Text)
    status = Column(
        SAEnum(
            AuditStatus,
            values_callable=lambda x: [e.value for e in AuditStatus],
            native_enum=False,
        ),
        default=AuditStatus.PENDING,
    )
    resolved_by = Column(
        String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
