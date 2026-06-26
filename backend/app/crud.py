import uuid
import re
from sqlalchemy.orm import Session
from sqlalchemy import func,text
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SENSITIVE_WORDS = ["荐股", "稳赚", "内幕消息", "涨停板", " guaranteed profit", "翻倍", "操盘",
                   "代客理财", "收费荐股", "黑马", "天天涨停", "必涨", "内部消息", "收益承诺"]

def check_sensitive(content):
    """检查内容是否含敏感词，返回匹配到的敏感词列表"""
    if not content:
        return []
    found = []
    for word in SENSITIVE_WORDS:
        if word in content:
            found.append(word)
    return found


def add_points(db: Session, user_id: str, points: int):
    """添加积分，不自动提交事务，由调用者决定何时提交"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if user:
        user.points = (user.points or 0) + points
        user.level = min((user.points or 0) // 100 + 1, 50)
        # 移除db.commit()，由调用者决定何时提交


# =====================================================
# 用户 CRUD
# =====================================================


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email, models.User.is_deleted == False)
        .first()
    )


def get_user_by_phone(db: Session, phone: str):
    return (
        db.query(models.User)
        .filter(models.User.phone == phone, models.User.is_deleted == False)
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
    email = user.email
    if not email and user.phone:
        email = f"phone_{user.phone}@placeholder.local"
    elif not email:
        email = f"user_{uuid.uuid4().hex[:8]}@placeholder.local"
    db_user = models.User(
        nickname=user.nickname,
        email=email,
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


def update_user(db: Session, user_id: str, user: schemas.UserBase):
    db_user = db.query(models.User).filter(models.User.user_id == user_id, models.User.is_deleted == False).first()
    if not db_user:
        return None
    for field, value in user.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def soft_delete_user(db: Session, user_id: str):
    db_user = db.query(models.User).filter(models.User.user_id == user_id, models.User.is_deleted == False).first()
    if not db_user:
        return False
    db_user.is_deleted = True
    db.add(db_user)
    db.commit()
    return True


def follow_user(db: Session, follower_id: str, following_id: str):
    # prevent duplicates
    exists = (
        db.execute(
            text("SELECT 1 FROM user_follows WHERE follower_id = :f AND following_id = :t"),
            {"f": follower_id, "t": following_id},
        )
        .first()
    )
    if exists:
        return False
    db.execute(
        text("INSERT INTO user_follows (follower_id, following_id) VALUES (:f, :t)"),
        {"f": follower_id, "t": following_id},
    )
    db.commit()
    return True


def unfollow_user(db: Session, follower_id: str, following_id: str):
    db.execute(
        text("DELETE FROM user_follows WHERE follower_id = :f AND following_id = :t"),
        {"f": follower_id, "t": following_id},
    )
    db.commit()
    return True


# ------------------- Attachments -------------------
def create_attachment_record(db: Session, user_id: str, post_id: str, filename: str, file_path: str, file_type: str = None, file_size: int = None):
    from .models import Attachment

    att = Attachment(
        post_id=post_id,
        user_id=user_id,
        filename=filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return att


# ------------------- Polls -------------------
def create_poll(db: Session, poll_in):
    from .models import Poll, PollOption

    poll = Poll(
        post_id=poll_in.post_id, question=poll_in.question, allow_multiple=poll_in.allow_multiple
    )
    db.add(poll)
    db.flush()
    # create options
    for idx, opt in enumerate(poll_in.options):
        po = PollOption(poll_id=poll.poll_id, text=opt.text, display_order=idx)
        db.add(po)
    db.commit()
    db.refresh(poll)
    return poll


def get_poll(db: Session, poll_id: str):
    from .models import Poll

    return db.query(Poll).filter(Poll.poll_id == poll_id).first()


def get_poll_with_options(db: Session, poll_id: str):
    from .models import Poll, PollOption

    poll = db.query(Poll).filter(Poll.poll_id == poll_id).first()
    if not poll:
        return None
    options = db.query(PollOption).filter(PollOption.poll_id == poll.poll_id).order_by(PollOption.display_order).all()
    poll.options = options
    return poll


def vote_poll(db: Session, user_id: str, poll_id: str, option_id: str):
    """Cast a vote; prevents duplicate voting per poll when allow_multiple is False."""
    from .models import PollVote, PollOption, Poll

    # load poll and check
    poll = db.query(Poll).filter(Poll.poll_id == poll_id).with_for_update().first()
    if not poll:
        return None

    if not poll.allow_multiple:
        prior = db.query(PollVote).filter(PollVote.user_id == user_id, PollVote.poll_id == poll_id).first()
        if prior:
            return False

    # ensure not already voted same option
    exists = db.query(PollVote).filter(PollVote.user_id == user_id, PollVote.option_id == option_id).first()
    if exists:
        return False

    # create vote
    vote = PollVote(user_id=user_id, option_id=option_id, poll_id=poll_id)
    db.add(vote)

    opt = db.query(PollOption).filter(PollOption.option_id == option_id).with_for_update().first()
    if not opt:
        return None
    opt.vote_count = (opt.vote_count or 0) + 1
    db.add(opt)

    if poll:
        poll.total_votes = (poll.total_votes or 0) + 1
        db.add(poll)

    db.commit()
    return True


# ------------------- Engagements -------------------
def add_engagement(db: Session, user_id: str, content_id: str, content_type: str, engagement_type: str):
    from .models import Engagement

    exists = (
        db.query(Engagement)
        .filter(
            Engagement.user_id == user_id,
            Engagement.content_id == content_id,
            Engagement.engagement_type == engagement_type,
        )
        .first()
    )
    if exists:
        return False
    e = Engagement(
        user_id=user_id, content_id=content_id, content_type=content_type, engagement_type=engagement_type
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return True


def remove_engagement(db: Session, user_id: str, content_id: str, engagement_type: str):
    from .models import Engagement
    db.query(Engagement).filter(
        Engagement.user_id == user_id,
        Engagement.content_id == content_id,
        Engagement.engagement_type == engagement_type,
    ).delete()
    db.commit()
    return True


# ------------------- Messages & Notifications -------------------
def send_message(db: Session, sender_id: str, recipient_id: str, content: str):
    from .models import Message

    msg = Message(sender_id=sender_id, recipient_id=recipient_id, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_conversation_messages(db: Session, user_id: str, other_user_id: str, page: int = 1, per_page: int = 50):
    from .models import Message

    offset = (page - 1) * per_page
    msgs = (
        db.query(Message)
        .filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == other_user_id))
            | ((Message.sender_id == other_user_id) & (Message.recipient_id == user_id))
        )
        .order_by(Message.created_at.asc())
        .offset(offset)
        .limit(per_page)
        .all()
    )
    return msgs


def mark_messages_read(db: Session, recipient_id: str, sender_id: str = None):
    from .models import Message

    q = db.query(Message).filter(Message.recipient_id == recipient_id, Message.is_read == False)
    if sender_id:
        q = q.filter(Message.sender_id == sender_id)
    q.update({Message.is_read: True})
    db.commit()
    return True


def count_unread_messages(db: Session, user_id: str):
    from .models import Message

    return db.query(Message).filter(Message.recipient_id == user_id, Message.is_read == False, Message.is_deleted == False).count()


def create_notification(db: Session, user_id: str, type: str, content: str = None):
    from .models import Notification

    n = Notification(user_id=user_id, type=type, content=content)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def list_notifications(db: Session, user_id: str, page: int = 1, per_page: int = 50):
    from .models import Notification

    offset = (page - 1) * per_page
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )


def mark_notifications_read(db: Session, user_id: str, notification_id: str = None):
    from .models import Notification

    q = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False)
    if notification_id:
        q = q.filter(Notification.notification_id == notification_id)
    q.update({Notification.is_read: True})
    db.commit()
    return True


def count_unread_notifications(db: Session, user_id: str):
    from .models import Notification

    return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()


# =====================================================
# 板块 (Board) CRUD
# =====================================================


def get_board(db: Session, board_id: str):
    return db.query(models.Board).filter(models.Board.board_id == board_id).first()


def get_boards(db: Session, skip: int = 0, limit: int = 20, category: str = None):
    query = db.query(models.Board).filter(models.Board.is_active == True)
    if category:
        query = query.filter(models.Board.category == category)
    return query.offset(skip).limit(limit).all()


def create_board(db: Session, board: schemas.BoardCreate):
    db_board = models.Board(**board.model_dump())
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board


def update_board(db: Session, board_id: str, board: schemas.BoardCreate):
    db_board = get_board(db, board_id)
    if not db_board:
        return None
    for key, value in board.model_dump().items():
        setattr(db_board, key, value)
    db.commit()
    db.refresh(db_board)
    return db_board


def subscribe_board(db: Session, user_id: str, board_id: str):
    """用户订阅板块"""
    subscription = (
        db.query(models.BoardSubscription)
        .filter(
            models.BoardSubscription.user_id == user_id,
            models.BoardSubscription.board_id == board_id,
        )
        .first()
    )
    if subscription:
        return subscription

    subscription = models.BoardSubscription(user_id=user_id, board_id=board_id)
    db.add(subscription)

    # 更新板块成员数
    board = get_board(db, board_id)
    if board:
        board.member_count = (
            db.query(models.BoardSubscription)
            .filter(models.BoardSubscription.board_id == board_id)
            .count()
        )

    db.commit()
    return subscription


def unsubscribe_board(db: Session, user_id: str, board_id: str):
    """用户取消订阅板块"""
    subscription = (
        db.query(models.BoardSubscription)
        .filter(
            models.BoardSubscription.user_id == user_id,
            models.BoardSubscription.board_id == board_id,
        )
        .first()
    )
    if subscription:
        db.delete(subscription)

        # 更新板块成员数
        board = get_board(db, board_id)
        if board:
            board.member_count = (  # type: ignore
                db.query(models.BoardSubscription)
                .filter(models.BoardSubscription.board_id == board_id)
                .count()
            )

        db.commit()
    return subscription


# =====================================================
# 标签 (Tag) CRUD
# =====================================================


def get_tag(db: Session, tag_id: str):
    return db.query(models.Tag).filter(models.Tag.tag_id == tag_id).first()


def get_or_create_tag(db: Session, name: str, category: str):
    """获取或创建标签"""
    tag = (
        db.query(models.Tag)
        .filter(models.Tag.name == name, models.Tag.category == category)
        .first()
    )
    if not tag:
        tag = models.Tag(name=name, category=category)
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag


def get_tags(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: str = None,
    is_hot: bool = None,
):
    query = db.query(models.Tag)
    if category:
        query = query.filter(models.Tag.category == category)
    if is_hot is not None:
        query = query.filter(models.Tag.is_hot == is_hot)
    return query.offset(skip).limit(limit).all()


# =====================================================
# 帖子 (Post) CRUD
# =====================================================


def get_post(db: Session, post_id: str):
    return (
        db.query(models.Post)
        .filter(models.Post.post_id == post_id, models.Post.is_deleted == False)
        .first()
    )


def get_posts(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    board_id: str = None,  # type: ignore
    user_id: str = None,
    post_type: str = None,
    tag_id: str = None,
    q: str = None,
    include_deleted: bool = False,
    order_by: str = "created_at",  # 'hot', 'created_at', 'comment_count', 'like_count', 'essence'
    is_essence: bool = None,
):
    """获取帖子列表"""
    query = db.query(models.Post)
    # 默认只返回未删除且已发布的帖子
    if not include_deleted:
        query = query.filter(
            models.Post.is_deleted == False,
            models.Post.status == models.PostStatus.PUBLISHED.value,
        )

    if board_id:
        query = query.filter(models.Post.board_id == board_id)
    if user_id:
        query = query.filter(models.Post.user_id == user_id)
    if post_type:
        query = query.filter(models.Post.post_type == post_type)
    if q:
        like = f"%{q}%"
        query = query.filter(
            models.Post.title.ilike(like) | models.Post.content.ilike(like)
        )

    # 按标签名过滤（需要 join post_tags + tags）
    if tag_id:
        query = (
            query.join(models.PostTag, models.Post.post_id == models.PostTag.post_id)
            .join(models.Tag, models.Tag.tag_id == models.PostTag.tag_id)
            .filter(models.Tag.tag_id == tag_id)
        )

    # filter by essence if requested
    if is_essence is not None:
        query = query.filter(models.Post.is_essence == bool(is_essence))

    # ordering
    if order_by == "hot":
        query = query.order_by(models.Post.view_count.desc(), models.Post.like_count.desc())
    elif order_by == "comment_count":
        query = query.order_by(models.Post.comment_count.desc())
    elif order_by == "like_count":
        query = query.order_by(models.Post.like_count.desc())
    else:
        # default to created_at desc
        query = query.order_by(models.Post.created_at.desc())

    return query.offset(skip).limit(limit).all()


def create_post(db: Session, post: schemas.PostCreate, user_id: str):
    """创建帖子"""
    # 敏感词检查
    sensitive = check_sensitive(post.title) + check_sensitive(post.content)
    db_post = models.Post(
        user_id=user_id,
        board_id=post.board_id,
        title=post.title,
        content=post.content,
        post_type=(
            post.post_type.value
            if hasattr(post.post_type, "value")
            else (post.post_type or "DISCUSSION")
        ),
        audit_status="FLAGGED" if sensitive else "APPROVED",
    )
    db.add(db_post)
    db.flush()

    if sensitive:
        viol = models.Violation(
            target_type="POST", target_id=db_post.post_id,
            reporter_id=None, reason=f"敏感词自动拦截: {', '.join(sensitive)}",
            status="FLAGGED",
        )
        db.add(viol)

    # 添加标签
    if post.tags:
        for tag_name in post.tags:
            tag = get_or_create_tag(db, tag_name, "OTHER")
            db_post_tag = models.PostTag(post_id=db_post.post_id, tag_id=tag.tag_id)
            db.add(db_post_tag)
            tag.usage_count += 1

    # 更新板块帖子数
    board = get_board(db, post.board_id)
    if board:
        board.post_count += 1

    db.commit()
    db.refresh(db_post)

    add_points(db, user_id, 5)

    return db_post


def update_post(db: Session, post_id: str, post: schemas.PostUpdate):
    """更新帖子"""
    db_post = get_post(db, post_id)
    if not db_post:
        return None

    for key, value in post.model_dump(exclude_unset=True).items():
        # 如果是枚举，取其 value（字符串），避免把 Enum 对象写入 DB
        if hasattr(value, "value"):
            value = value.value
        setattr(db_post, key, value)

    db.commit()
    db.refresh(db_post)
    return db_post


def delete_post(db: Session, post_id: str):
    """软删除帖子"""
    db_post = get_post(db, post_id)
    if not db_post:
        return None

    db_post.status = models.PostStatus.DELETED.value
    db_post.is_deleted = True

    # 清理帖子与标签的关联：减少标签使用计数并删除关联行
    post_tags = (
        db.query(models.PostTag).filter(models.PostTag.post_id == db_post.post_id).all()
    )
    for pt in post_tags:
        tag = db.query(models.Tag).filter(models.Tag.tag_id == pt.tag_id).first()
        if tag and tag.usage_count and tag.usage_count > 0:
            tag.usage_count -= 1
        # 删除关联记录
        db.delete(pt)

    # 更新板块帖子数
    board = get_board(db, db_post.board_id)
    if board and board.post_count > 0:
        board.post_count -= 1

    db.commit()
    db.refresh(db_post)
    return db_post


def increment_post_view(db: Session, post_id: str):
    """增加帖子浏览次数"""
    db_post = get_post(db, post_id)
    if db_post:
        db_post.view_count += 1
        db.commit()
        db.refresh(db_post)
    return db_post


def increment_post_like(db: Session, post_id: str):
    """增加帖子点赞数"""
    db_post = get_post(db, post_id)
    if db_post:
        db_post.like_count += 1
        add_points(db, db_post.user_id, 1)
        db.commit()
        db.refresh(db_post)
    return db_post


# =====================================================
# 评论 (Comment) CRUD
# =====================================================


def get_comment(db: Session, comment_id: str):
    return (
        db.query(models.Comment)
        .filter(
            models.Comment.comment_id == comment_id, models.Comment.is_deleted == False
        )
        .first()
    )


def get_comments(
    db: Session,
    post_id: str,
    skip: int = 0,
    limit: int = 20,
    parent_comment_id: str = None,
):
    """获取评论列表"""
    query = db.query(models.Comment).filter(
        models.Comment.post_id == post_id,
        models.Comment.is_deleted == False,
    )

    if parent_comment_id:
        query = query.filter(models.Comment.parent_comment_id == parent_comment_id)
    else:
        query = query.filter(models.Comment.parent_comment_id.is_(None))

    return (
        query.order_by(models.Comment.created_at.asc()).offset(skip).limit(limit).all()
    )


def create_comment(db: Session, comment: schemas.CommentCreate, user_id: str):
    """创建评论"""
    sensitive = check_sensitive(comment.content)
    db_comment = models.Comment(
        user_id=user_id,
        post_id=comment.post_id,
        parent_comment_id=comment.parent_comment_id,
        content=comment.content,
        audit_status="FLAGGED" if sensitive else "APPROVED",
    )
    db.add(db_comment)

    if sensitive:
        viol = models.Violation(
            target_type="COMMENT", target_id=db_comment.comment_id,
            reporter_id=None, reason=f"敏感词自动拦截: {', '.join(sensitive)}",
            status="FLAGGED",
        )
        db.add(viol)

    # 更新帖子评论数
    post = get_post(db, comment.post_id)
    if post:
        post.comment_count += 1

    add_points(db, user_id, 2)
    
    db.commit()
    db.refresh(db_comment)

    return db_comment


def update_comment(db: Session, comment_id: str, comment: schemas.CommentUpdate):
    """更新评论"""
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None

    for key, value in comment.model_dump(exclude_unset=True).items():
        setattr(db_comment, key, value)

    db.commit()
    db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: str):
    """软删除评论"""
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None

    db_comment.is_deleted = True

    # 更新帖子评论数
    post = get_post(db, db_comment.post_id)
    if post and post.comment_count > 0:
        post.comment_count -= 1

    db.commit()
    db.refresh(db_comment)
    return db_comment


def increment_comment_like(db: Session, comment_id: str):
    """增加评论点赞数"""
    db_comment = get_comment(db, comment_id)
    if db_comment:
        db_comment.like_count += 1
        db.commit()
        db.refresh(db_comment)
    return db_comment


# =====================================================
# 互动 (Engagement) CRUD
# =====================================================


def create_or_update_engagement(
    db: Session, user_id: str, content_id: str, content_type: str, engagement_type: str
):
    """创建或更新互动记录（如点赞、收藏等）"""
    engagement = (
        db.query(models.Engagement)
        .filter(
            models.Engagement.user_id == user_id,
            models.Engagement.content_id == content_id,
            models.Engagement.engagement_type == engagement_type,
        )
        .first()
    )

    if engagement:
        return engagement  # 已存在，不重复添加

    engagement = models.Engagement(
        user_id=user_id,
        content_id=content_id,
        content_type=content_type,
        engagement_type=engagement_type,
    )
    db.add(engagement)
    db.commit()
    db.refresh(engagement)
    return engagement


def remove_engagement(db: Session, user_id: str, content_id: str, engagement_type: str):
    """删除互动记录"""
    engagement = (
        db.query(models.Engagement)
        .filter(
            models.Engagement.user_id == user_id,
            models.Engagement.content_id == content_id,
            models.Engagement.engagement_type == engagement_type,
        )
        .first()
    )

    if engagement:
        db.delete(engagement)
        db.commit()

    return engagement


def get_engagement(db: Session, user_id: str, content_id: str, engagement_type: str):
    """获取互动记录"""
    return (
        db.query(models.Engagement)
        .filter(
            models.Engagement.user_id == user_id,
            models.Engagement.content_id == content_id,
            models.Engagement.engagement_type == engagement_type,
        )
        .first()
    )


# =====================================================
# Stocks / Realtime / Audit CRUD
# =====================================================


def get_stock_by_symbol(db: Session, symbol: str):
    return db.query(models.StockInfo).filter(models.StockInfo.symbol == symbol).first()


def get_stock(db: Session, stock_id: str):
    return (
        db.query(models.StockInfo).filter(models.StockInfo.stock_id == stock_id).first()
    )


def list_stocks(db: Session, skip: int = 0, limit: int = 50):
    return (
        db.query(models.StockInfo)
        .order_by(models.StockInfo.symbol.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_or_update_stock(db: Session, stock: schemas.StockInfoCreate):
    existing = get_stock_by_symbol(db, stock.symbol)
    if existing:
        # update fields
        existing.name = stock.name
        existing.last_price = stock.last_price
        existing.change = stock.change
        existing.percent_change = stock.percent_change
        existing.volume = stock.volume
        existing.market_time = stock.market_time
        existing.updated_at = func.now()
        db.commit()
        db.refresh(existing)
        return existing

    db_stock = models.StockInfo(
        symbol=stock.symbol,
        name=stock.name,
        last_price=stock.last_price,
        change=stock.change,
        percent_change=stock.percent_change,
        volume=stock.volume,
        market_time=stock.market_time,
    )
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock


def create_realtime_discussion(
    db: Session, disc: schemas.RealtimeDiscussionCreate, user_id: str
):
    db_disc = models.RealtimeDiscussion(
        stock_id=disc.stock_id, user_id=user_id, content=disc.content
    )
    db.add(db_disc)
    db.commit()
    db.refresh(db_disc)
    return db_disc


def update_stock(db: Session, stock_id: str, stock: schemas.StockInfoUpdate):
    existing = get_stock(db, stock_id)
    if not existing:
        return None

    for key, value in stock.model_dump(exclude_unset=True).items():
        setattr(existing, key, value)

    existing.updated_at = func.now()
    db.commit()
    db.refresh(existing)
    return existing


def get_realtime_discussions(
    db: Session, stock_id: str = None, skip: int = 0, limit: int = 50
):
    q = db.query(models.RealtimeDiscussion)
    if stock_id:
        q = q.filter(models.RealtimeDiscussion.stock_id == stock_id)
    return (
        q.order_by(models.RealtimeDiscussion.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_audit_log(
    db: Session,
    actor_id: str,
    target_type: str,
    target_id: str,
    action: str,
    details: str = None,
):
    log = models.AuditLog(
        actor_id=actor_id,
        target_type=target_type,
        target_id=target_id,
        action=action,
        details=details,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_audit_logs(
    db: Session,
    target_type: str = None,
    target_id: str = None,
    actor_id: str = None,
    audit_id: str = None,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.AuditLog)
    if target_type:
        q = q.filter(models.AuditLog.target_type == target_type)
    if target_id:
        q = q.filter(models.AuditLog.target_id == target_id)
    if actor_id:
        q = q.filter(models.AuditLog.actor_id == actor_id)
    if audit_id:
        q = q.filter(models.AuditLog.audit_id == audit_id)
    return q.order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()


def create_violation(db: Session, v: schemas.ViolationCreate, reporter_id: str = None):
    viol = models.Violation(
        target_type=v.target_type,
        target_id=v.target_id,
        reporter_id=reporter_id,
        reason=v.reason,
    )
    db.add(viol)
    db.commit()
    db.refresh(viol)
    # 记录审计日志：有人提交了举报
    try:
        create_audit_log(
            db,
            actor_id=reporter_id,
            target_type="VIOLATION",
            target_id=viol.violation_id,
            action="REPORT_VIOLATION",
            details=v.reason,
        )
    except Exception:
        # 日志写入失败不应影响举报提交
        pass
    return viol


def get_violations(
    db: Session,
    status: str = None,
    target_id: str = None,
    violation_id: str = None,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.Violation)
    if status:
        q = q.filter(models.Violation.status == status)
    if target_id:
        q = q.filter(models.Violation.target_id == target_id)
    if violation_id:
        q = q.filter(models.Violation.violation_id == violation_id)
    return (
        q.order_by(models.Violation.created_at.desc()).offset(skip).limit(limit).all()
    )


def resolve_violation(
    db: Session, violation_id: str, resolver_id: str, status: str = "APPROVED"
):
    v = (
        db.query(models.Violation)
        .filter(models.Violation.violation_id == violation_id)
        .first()
    )
    if not v:
        return None
    if hasattr(status, "value"):
        v.status = status.value
    else:
        v.status = status
    v.resolved_by = resolver_id
    v.resolved_at = func.now()

    if status == "APPROVED" or status == "FLAGGED":
        target = v.target_type
        target_id = v.target_id
        if target == "POST":
            post = db.query(models.Post).filter(models.Post.post_id == target_id).first()
            if post:
                post.is_deleted = True
                post.status = "DELETED"
        elif target == "COMMENT":
            comment = db.query(models.Comment).filter(models.Comment.comment_id == target_id).first()
            if comment:
                comment.is_deleted = True
        uid = None
        if target == "POST" and post:
            uid = post.user_id
        elif target == "COMMENT" and comment:
            uid = comment.user_id
        if uid:
            user = db.query(models.User).filter(models.User.user_id == uid).first()
            if user and user.status == "ACTIVE":
                user.status = "SUSPENDED"

    db.commit()
    db.refresh(v)
    try:
        create_audit_log(
            db,
            actor_id=resolver_id,
            target_type="VIOLATION",
            target_id=v.violation_id,
            action="RESOLVE_VIOLATION",
            details=f"status={v.status}",
        )
    except Exception:
        pass
    return v

def get_groups(db: Session, query: str = None, skip: int = 0, limit: int = 20):
    q = db.query(models.Group).filter(models.Group.is_deleted == False)
    if query:
        like_pattern = f"%{query}%"
        q = q.filter(models.Group.name.ilike(like_pattern))
    return q.order_by(models.Group.created_at.desc()).offset(skip).limit(limit).all()


def get_group(db: Session, group_id: str):
    return (
        db.query(models.Group)
        .filter(models.Group.group_id == group_id, models.Group.is_deleted == False)
        .first()
    )


def get_group_membership(db: Session, group_id: str, user_id: str):
    """获取用户在群组中的成员资格"""
    return (
        db.query(models.GroupMembership)
        .filter(
            models.GroupMembership.group_id == group_id,
            models.GroupMembership.user_id == user_id
        )
        .first()
    )


def create_group(db: Session, group_in: schemas.GroupCreate, owner_id: str):
    group = models.Group(
        name=group_in.name,
        description=group_in.description,
        access_level=group_in.access_level,
        owner_id=owner_id,
        member_count=1,
    )
    db.add(group)
    db.flush()

    db.execute(
        text(
            "INSERT INTO group_memberships (group_id, user_id, role, joined_at) "
            "VALUES (:group_id, :user_id, :role, CURRENT_TIMESTAMP)"
        ),
        {"group_id": group.group_id, "user_id": owner_id, "role": "OWNER"},
    )

    db.commit()
    db.refresh(group)
    return group


def join_group(db: Session, user_id: str, group_id: str):
    exists = db.query(models.GroupMembership).filter(
        models.GroupMembership.group_id == group_id,
        models.GroupMembership.user_id == user_id,
    ).first()
    if exists:
        return False

    membership = models.GroupMembership(
        group_id=group_id,
        user_id=user_id,
        role="MEMBER",
    )
    db.add(membership)

    group = db.query(models.Group).filter(models.Group.group_id == group_id).first()
    if group:
        group.member_count = (group.member_count or 0) + 1
        db.add(group)

    db.commit()
    return True


def create_certification(db: Session, user_id: str, cert_type: str, file_path: str = None, description: str = None):
    cert = models.Certification(user_id=user_id, cert_type=cert_type, file_path=file_path, description=description)
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


def list_certifications(db: Session, status: str = None, skip: int = 0, limit: int = 50):
    q = db.query(models.Certification).order_by(models.Certification.created_at.desc())
    if status:
        q = q.filter(models.Certification.status == status)
    return q.offset(skip).limit(limit).all()


def review_certification(db: Session, cert_id: str, status: str, reviewed_by: str, remark: str = None):
    cert = db.query(models.Certification).filter(models.Certification.cert_id == cert_id).first()
    if not cert:
        return None
    cert.status = status
    cert.reviewed_by = reviewed_by
    if remark:
        cert.admin_remark = remark
    db.commit()
    db.refresh(cert)
    if status == "APPROVED":
        user = db.query(models.User).filter(models.User.user_id == cert.user_id).first()
        if user:
            user.auth_level = "EXPERT"
            db.commit()
    return cert


def create_risk_assessment(db: Session, user_id: str, answers: str, score: int, risk_level: str):
    assessment = models.RiskAssessment(user_id=user_id, answers=answers, score=score, risk_level=risk_level)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def list_risk_assessments(db: Session, status: str = None, skip: int = 0, limit: int = 50):
    q = db.query(models.RiskAssessment).order_by(models.RiskAssessment.created_at.desc())
    if status:
        q = q.filter(models.RiskAssessment.status == status)
    return q.offset(skip).limit(limit).all()


def review_risk_assessment(db: Session, assessment_id: str, status: str, reviewed_by: str):
    assessment = db.query(models.RiskAssessment).filter(models.RiskAssessment.assessment_id == assessment_id).first()
    if not assessment:
        return None
    assessment.status = status
    assessment.reviewed_by = reviewed_by
    db.commit()
    db.refresh(assessment)
    return assessment


def leave_group(db: Session, user_id: str, group_id: str):
    membership = db.query(models.GroupMembership).filter(
        models.GroupMembership.group_id == group_id,
        models.GroupMembership.user_id == user_id,
    ).first()
    if not membership:
        return False

    db.delete(membership)

    group = db.query(models.Group).filter(models.Group.group_id == group_id).first()
    if group and group.member_count and group.member_count > 0:
        group.member_count -= 1
        db.add(group)

    db.commit()
    return True