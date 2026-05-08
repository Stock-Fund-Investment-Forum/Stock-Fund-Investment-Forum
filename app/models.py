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
)
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
