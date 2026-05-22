from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =====================================================
# 用户 CRUD
# =====================================================


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
    include_deleted: bool = False,
    order_by: str = "created_at",  # 'hot', 'created_at'
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

    # 按标签名过滤（需要 join post_tags + tags）
    if tag_id:
        query = (
            query.join(models.PostTag, models.Post.post_id == models.PostTag.post_id)
            .join(models.Tag, models.Tag.tag_id == models.PostTag.tag_id)
            .filter(models.Tag.tag_id == tag_id)
        )

    if order_by == "hot":
        query = query.order_by(
            models.Post.view_count.desc(), models.Post.like_count.desc()
        )
    else:
        query = query.order_by(models.Post.created_at.desc())

    return query.offset(skip).limit(limit).all()


def create_post(db: Session, post: schemas.PostCreate, user_id: str):
    """创建帖子"""
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
    )
    db.add(db_post)
    db.flush()

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
    db_comment = models.Comment(
        user_id=user_id,
        post_id=comment.post_id,
        parent_comment_id=comment.parent_comment_id,
        content=comment.content,
    )
    db.add(db_comment)

    # 更新帖子评论数
    post = get_post(db, comment.post_id)
    if post:
        post.comment_count += 1

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
    # support Enum instances or plain strings
    if hasattr(status, "value"):
        v.status = status.value
    else:
        v.status = status
    v.resolved_by = resolver_id
    v.resolved_at = func.now()
    db.commit()
    db.refresh(v)
    # 记录审计日志：有人处理了举报
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
