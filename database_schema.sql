-- =====================================================
-- 股票基金投资论坛 - 数据库结构设计
-- =====================================================
-- 数据库创建
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS stock_fund_forum;
USE stock_fund_forum;

-- 设置字符集为UTF-8以支持中文
ALTER DATABASE stock_fund_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- 用户模块表
-- =====================================================

-- 用户表 - 核心用户信息
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY COMMENT '用户唯一标识',
    nickname VARCHAR(50) NOT NULL UNIQUE COMMENT '用户昵称',
    email VARCHAR(120) NOT NULL UNIQUE COMMENT '邮箱地址',
    phone VARCHAR(20) COMMENT '手机号码',
    avatar VARCHAR(255) COMMENT '头像URL',
    bio TEXT COMMENT '个人简介',
    auth_level ENUM('UNVERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'REAL_NAME_VERIFIED', 'EXPERT') DEFAULT 'UNVERIFIED' COMMENT '认证等级',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED') DEFAULT 'ACTIVE' COMMENT '账户状态',
    level INT DEFAULT 1 COMMENT '用户等级',
    points INT DEFAULT 0 COMMENT '用户积分',
    influence_value DECIMAL(10, 2) DEFAULT 0.00 COMMENT '影响力值',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否软删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_email (email),
    INDEX idx_nickname (nickname),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 认证信息表
CREATE TABLE IF NOT EXISTS authentication (
    auth_id VARCHAR(36) PRIMARY KEY COMMENT '认证记录唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    type ENUM('EMAIL', 'PHONE', 'REAL_NAME', 'EXPERT_VERIFICATION', 'SOCIAL_LOGIN') NOT NULL COMMENT '认证类型',
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED') DEFAULT 'PENDING' COMMENT '认证状态',
    credentials JSON COMMENT '认证凭证（JSON格式）',
    verified_at TIMESTAMP NULL COMMENT '验证完成时间',
    expired_at TIMESTAMP NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type_status (type, status),
    INDEX idx_verified_at (verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='认证信息表';

-- 用户关注关系表
CREATE TABLE IF NOT EXISTS user_follows (
    follower_id VARCHAR(36) NOT NULL COMMENT '粉丝用户ID',
    following_id VARCHAR(36) NOT NULL COMMENT '被关注用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_following_id (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注关系表';

-- =====================================================
-- 社区结构表
-- =====================================================

-- 板块表
CREATE TABLE IF NOT EXISTS boards (
    board_id VARCHAR(36) PRIMARY KEY COMMENT '板块唯一标识',
    name VARCHAR(100) NOT NULL COMMENT '板块名称',
    category ENUM('GENERAL', 'STOCKS', 'FUNDS', 'ANALYSIS', 'NEWS', 'QUESTIONS', 'STRATEGIES') COMMENT '板块分类',
    description TEXT COMMENT '板块描述',
    post_count INT DEFAULT 0 COMMENT '帖子数',
    member_count INT DEFAULT 0 COMMENT '成员数',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='板块表';

-- 板块订阅关系表
CREATE TABLE IF NOT EXISTS board_subscriptions (
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    board_id VARCHAR(36) NOT NULL COMMENT '板块ID',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '订阅时间',
    PRIMARY KEY (user_id, board_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE,
    INDEX idx_board_id (board_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='板块订阅关系表';

-- 群组表
CREATE TABLE IF NOT EXISTS groups (
    group_id VARCHAR(36) PRIMARY KEY COMMENT '群组唯一标识',
    owner_id VARCHAR(36) NOT NULL COMMENT '群组所有者ID',
    name VARCHAR(100) NOT NULL COMMENT '群组名称',
    description TEXT COMMENT '群组描述',
    access_level ENUM('PUBLIC', 'PRIVATE', 'INTERNAL') DEFAULT 'PUBLIC' COMMENT '访问权限级别',
    member_count INT DEFAULT 1 COMMENT '成员数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_access_level (access_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组表';

-- 群组成员关系表
CREATE TABLE IF NOT EXISTS group_memberships (
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    group_id VARCHAR(36) NOT NULL COMMENT '群组ID',
    role ENUM('OWNER', 'ADMIN', 'MEMBER') DEFAULT 'MEMBER' COMMENT '成员角色',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    INDEX idx_group_id (group_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组成员关系表';

-- =====================================================
-- 内容管理表
-- =====================================================

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    tag_id VARCHAR(36) PRIMARY KEY COMMENT '标签唯一标识',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    category ENUM('STOCK', 'FUND', 'STRATEGY', 'ANALYSIS', 'NEWS', 'OTHER') NOT NULL COMMENT '标签分类',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    is_hot BOOLEAN DEFAULT FALSE COMMENT '是否热门标签',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX uk_name_category (name, category),
    INDEX idx_category_hot (category, is_hot),
    INDEX idx_usage_count (usage_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
    post_id VARCHAR(36) PRIMARY KEY COMMENT '帖子唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '发布者用户ID',
    board_id VARCHAR(36) NOT NULL COMMENT '板块ID',
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    content LONGTEXT NOT NULL COMMENT '帖子内容',
    post_type ENUM('QUESTION', 'DISCUSSION', 'ANALYSIS', 'NEWS', 'GUIDE') NOT NULL DEFAULT 'DISCUSSION' COMMENT '帖子类型',
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED') DEFAULT 'PUBLISHED' COMMENT '帖子状态',
    audit_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED') DEFAULT 'APPROVED' COMMENT '审核状态',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    comment_count INT DEFAULT 0 COMMENT '评论次数',
    is_essence BOOLEAN DEFAULT FALSE COMMENT '是否精华帖',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否软删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE,
    INDEX idx_board_status_created (board_id, status, created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_is_essence (is_essence),
    INDEX idx_audit_status (audit_status),
    INDEX idx_hot_posts (view_count DESC, like_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';

-- 帖子标签关系表
CREATE TABLE IF NOT EXISTS post_tags (
    post_id VARCHAR(36) NOT NULL COMMENT '帖子ID',
    tag_id VARCHAR(36) NOT NULL COMMENT '标签ID',
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子标签关系表';

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    comment_id VARCHAR(36) PRIMARY KEY COMMENT '评论唯一标识',
    post_id VARCHAR(36) NOT NULL COMMENT '所属帖子ID',
    parent_comment_id VARCHAR(36) COMMENT '父评论ID（支持楼中楼）',
    user_id VARCHAR(36) NOT NULL COMMENT '评论者用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    audit_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED') DEFAULT 'APPROVED' COMMENT '审核状态',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否软删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_parent_comment_id (parent_comment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_audit_status (audit_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 附件表
CREATE TABLE IF NOT EXISTS attachments (
    attachment_id VARCHAR(36) PRIMARY KEY COMMENT '附件唯一标识',
    post_id VARCHAR(36) NOT NULL COMMENT '关联帖子ID',
    user_id VARCHAR(36) NOT NULL COMMENT '上传者用户ID',
    filename VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    file_type ENUM('PDF', 'EXCEL', 'IMAGE', 'DOCUMENT', 'OTHER') COMMENT '文件类型',
    file_size INT COMMENT '文件大小（字节）',
    audit_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' COMMENT '审核状态',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否软删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_audit_status (audit_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='附件表';

-- =====================================================
-- 交互管理表
-- =====================================================

-- 投票表
CREATE TABLE IF NOT EXISTS polls (
    poll_id VARCHAR(36) PRIMARY KEY COMMENT '投票唯一标识',
    post_id VARCHAR(36) NOT NULL COMMENT '关联帖子ID',
    question VARCHAR(255) NOT NULL COMMENT '投票问题',
    total_votes INT DEFAULT 0 COMMENT '总投票数',
    status ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') DEFAULT 'ACTIVE' COMMENT '投票状态',
    allow_multiple BOOLEAN DEFAULT FALSE COMMENT '是否允许多选',
    allow_revote BOOLEAN DEFAULT FALSE COMMENT '是否允许改票',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    end_time TIMESTAMP NULL COMMENT '结束时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_status (status),
    INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票表';

-- 投票选项表
CREATE TABLE IF NOT EXISTS poll_options (
    option_id VARCHAR(36) PRIMARY KEY COMMENT '选项唯一标识',
    poll_id VARCHAR(36) NOT NULL COMMENT '投票ID',
    text VARCHAR(255) NOT NULL COMMENT '选项文本',
    vote_count INT DEFAULT 0 COMMENT '投票数',
    display_order INT COMMENT '显示顺序',
    FOREIGN KEY (poll_id) REFERENCES polls(poll_id) ON DELETE CASCADE,
    INDEX idx_poll_id (poll_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票选项表';

-- 投票记录表
CREATE TABLE IF NOT EXISTS poll_votes (
    vote_id VARCHAR(36) PRIMARY KEY COMMENT '投票记录唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '投票者用户ID',
    option_id VARCHAR(36) NOT NULL COMMENT '选项ID',
    poll_id VARCHAR(36) NOT NULL COMMENT '投票ID（冗余字段，用于快速查询）',
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '投票时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(option_id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES polls(poll_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_option (user_id, option_id),
    INDEX idx_poll_id (poll_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投票记录表';

-- 互动记录表
CREATE TABLE IF NOT EXISTS engagements (
    engagement_id VARCHAR(36) PRIMARY KEY COMMENT '互动唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    content_id VARCHAR(36) NOT NULL COMMENT '内容ID',
    content_type ENUM('POST', 'COMMENT', 'STOCK_INFO') COMMENT '内容类型',
    engagement_type ENUM('LIKE', 'SHARE', 'REPORT', 'BOOKMARK') COMMENT '互动类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_engagement (user_id, content_id, engagement_type),
    INDEX idx_user_id (user_id),
    INDEX idx_content_id (content_id),
    INDEX idx_engagement_type (engagement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='互动记录表';

-- =====================================================
-- 通信与通知表
-- =====================================================

-- 私信表
CREATE TABLE IF NOT EXISTS messages (
    message_id VARCHAR(36) PRIMARY KEY COMMENT '私信唯一标识',
    sender_id VARCHAR(36) NOT NULL COMMENT '发送者ID',
    recipient_id VARCHAR(36) NOT NULL COMMENT '接收者ID',
    content TEXT NOT NULL COMMENT '私信内容',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否软删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='私信表';

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(36) PRIMARY KEY COMMENT '通知唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '接收用户ID',
    type ENUM('COMMENT_REPLY', 'POST_LIKE', 'MESSAGE', 'SYSTEM', 'FOLLOW', 'MENTION') COMMENT '通知类型',
    content VARCHAR(500) COMMENT '通知内容',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- =====================================================
-- 审核与管理表
-- =====================================================

-- 审核日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id VARCHAR(36) PRIMARY KEY COMMENT '审核日志唯一标识',
    content_id VARCHAR(36) NOT NULL COMMENT '内容ID',
    user_id VARCHAR(36) COMMENT '审核者用户ID',
    content_type ENUM('POST', 'COMMENT', 'ATTACHMENT', 'REALTIME_DISCUSSION') COMMENT '内容类型',
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED') COMMENT '审核状态',
    risk_score INT DEFAULT 0 COMMENT '风险评分',
    reason VARCHAR(500) COMMENT '审核原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_content_id (content_id),
    INDEX idx_status (status),
    INDEX idx_risk_score (risk_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审核日志表';

-- 违规记录表
CREATE TABLE IF NOT EXISTS violations (
    violation_id VARCHAR(36) PRIMARY KEY COMMENT '违规记录唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '违规用户ID',
    type ENUM('SPAM', 'HARASSMENT', 'MISINFORMATION', 'ILLEGAL_CONTENT', 'OTHER') COMMENT '违规类型',
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') COMMENT '违规严重程度',
    status ENUM('PENDING', 'PROCESSED', 'APPEALED', 'RESOLVED') DEFAULT 'PENDING' COMMENT '处理状态',
    duration INT DEFAULT 0 COMMENT '禁言时长（分钟）',
    reason VARCHAR(500) COMMENT '违规原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    end_time TIMESTAMP NULL COMMENT '禁言结束时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_severity (severity),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='违规记录表';

-- =====================================================
-- 投资信息表
-- =====================================================

-- 股票信息表
CREATE TABLE IF NOT EXISTS stock_infos (
    stock_id VARCHAR(36) PRIMARY KEY COMMENT '股票信息唯一标识',
    symbol VARCHAR(20) NOT NULL COMMENT '股票代码',
    market ENUM('A_SHARE', 'HK_STOCK', 'US_STOCK', 'FUND') NOT NULL COMMENT '市场类型',
    name VARCHAR(100) NOT NULL COMMENT '股票名称',
    current_price DECIMAL(12, 2) COMMENT '当前价格',
    change DECIMAL(8, 2) COMMENT '涨跌幅百分比',
    high_price DECIMAL(12, 2) COMMENT '52周最高价',
    low_price DECIMAL(12, 2) COMMENT '52周最低价',
    discussion_count INT DEFAULT 0 COMMENT '讨论次数',
    positive_count INT DEFAULT 0 COMMENT '看涨讨论数',
    negative_count INT DEFAULT 0 COMMENT '看跌讨论数',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    UNIQUE KEY uk_symbol_market (symbol, market),
    INDEX idx_market (market),
    INDEX idx_discussion_count (discussion_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='股票信息表';

-- 实时讨论表
CREATE TABLE IF NOT EXISTS realtime_discussions (
    discussion_id VARCHAR(36) PRIMARY KEY COMMENT '讨论唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '发言用户ID',
    group_id VARCHAR(36) COMMENT '所属群组ID',
    stock_id VARCHAR(36) NOT NULL COMMENT '讨论的股票ID',
    content TEXT NOT NULL COMMENT '讨论内容',
    sentiment ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE') NOT NULL DEFAULT 'NEUTRAL' COMMENT '情绪倾向',
    audit_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED') DEFAULT 'APPROVED' COMMENT '审核状态',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否软删除',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE SET NULL,
    FOREIGN KEY (stock_id) REFERENCES stock_infos(stock_id) ON DELETE CASCADE,
    INDEX idx_stock_sentiment_created (stock_id, sentiment, created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_audit_status (audit_status),
    INDEX idx_group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实时讨论表';

-- 风险评估表
CREATE TABLE IF NOT EXISTS risk_assessments (
    assessment_id VARCHAR(36) PRIMARY KEY COMMENT '评估唯一标识',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    investment_years INT COMMENT '投资年限',
    risk_tolerance ENUM('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE') COMMENT '风险承受能力',
    knowledge_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') COMMENT '知识水平',
    investment_amount INT COMMENT '投资金额',
    score INT COMMENT '评估得分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='风险评估表';

-- =====================================================
-- 创建索引以优化查询性能
-- =====================================================

-- 复合索引 - 帖子查询优化
CREATE INDEX idx_posts_board_status ON posts(board_id, status, created_at);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);

-- 复合索引 - 评论查询优化
CREATE INDEX idx_comments_post_status ON comments(post_id, audit_status, created_at);

-- 复合索引 - 私信查询优化
CREATE INDEX idx_messages_user_read ON messages(recipient_id, is_read, created_at);

-- =====================================================
-- 视图 - 用于简化常用查询
-- =====================================================

-- 帖子详情视图（包含作者信息和板块名称）
CREATE OR REPLACE VIEW v_post_details AS
SELECT 
    p.post_id,
    p.title,
    p.content,
    p.view_count,
    p.like_count,
    p.is_essence,
    p.created_at,
    u.user_id,
    u.nickname,
    u.avatar,
    u.level,
    b.board_id,
    b.name AS board_name
FROM posts p
JOIN users u ON p.user_id = u.user_id
JOIN boards b ON p.board_id = b.board_id
WHERE p.is_deleted = FALSE AND p.status = 'PUBLISHED';

-- 热门帖子视图
CREATE OR REPLACE VIEW v_hot_posts AS
SELECT 
    post_id,
    title,
    view_count,
    like_count,
    created_at
FROM posts
WHERE is_deleted = FALSE 
    AND status = 'PUBLISHED'
    AND (view_count > 100 OR like_count > 20)
ORDER BY view_count DESC, like_count DESC;

-- 用户活跃度视图
CREATE OR REPLACE VIEW v_user_activity AS
SELECT 
    u.user_id,
    u.nickname,
    u.level,
    u.points,
    COUNT(DISTINCT p.post_id) AS post_count,
    COUNT(DISTINCT c.comment_id) AS comment_count,
    COUNT(DISTINCT m.message_id) AS message_count,
    COALESCE(MAX(p.created_at), MAX(c.created_at), MAX(m.created_at), u.created_at) AS last_activity_time
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id AND p.is_deleted = FALSE AND p.status = 'PUBLISHED'
LEFT JOIN comments c ON u.user_id = c.user_id AND c.is_deleted = FALSE AND c.audit_status = 'APPROVED'
LEFT JOIN messages m ON u.user_id = m.sender_id AND m.is_deleted = FALSE
WHERE u.is_deleted = FALSE
GROUP BY u.user_id, u.nickname, u.level, u.points;

-- 板块统计视图
CREATE OR REPLACE VIEW v_board_statistics AS
SELECT 
    b.board_id,
    b.name,
    b.category,
    b.is_active,
    COUNT(DISTINCT p.post_id) AS total_posts,
    COUNT(DISTINCT bs.user_id) AS subscribers,
    COUNT(DISTINCT c.comment_id) AS total_comments,
    COALESCE(SUM(p.view_count), 0) AS total_views
FROM boards b
LEFT JOIN posts p ON b.board_id = p.board_id AND p.is_deleted = FALSE AND p.status = 'PUBLISHED'
LEFT JOIN board_subscriptions bs ON b.board_id = bs.board_id
LEFT JOIN comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
GROUP BY b.board_id, b.name, b.category, b.is_active;

-- 热门股票视图
CREATE OR REPLACE VIEW v_hot_stocks AS
SELECT 
    s.stock_id,
    s.symbol,
    s.name,
    s.market,
    s.current_price,
    s.change,
    s.discussion_count,
    s.positive_count,
    s.negative_count,
    CASE 
        WHEN s.discussion_count = 0 THEN 0
        ELSE ROUND(s.positive_count * 100.0 / s.discussion_count, 2)
    END AS bullish_ratio
FROM stock_infos s
WHERE s.discussion_count > 0
ORDER BY s.discussion_count DESC;

-- 用户排行视图
CREATE OR REPLACE VIEW v_user_ranking AS
SELECT 
    u.user_id,
    u.nickname,
    u.avatar,
    u.level,
    u.points,
    u.influence_value,
    u.auth_level
FROM users u
WHERE u.is_deleted = FALSE AND u.status = 'ACTIVE'
ORDER BY u.points DESC, u.influence_value DESC;

-- =====================================================
-- 系统初始化数据
-- =====================================================

-- 初始化系统标签
INSERT IGNORE INTO tags (tag_id, name, category, is_hot) VALUES
('tag_stock_001', '科技股', 'STOCK', TRUE),
('tag_stock_002', '金融股', 'STOCK', TRUE),
('tag_stock_003', '消费股', 'STOCK', FALSE),
('tag_fund_001', '平衡型', 'FUND', FALSE),
('tag_fund_002', '成长型', 'FUND', FALSE),
('tag_fund_003', '价值型', 'FUND', FALSE),
('tag_strategy_001', '价值投资', 'STRATEGY', TRUE),
('tag_strategy_002', '成长投资', 'STRATEGY', TRUE),
('tag_analysis_001', '技术分析', 'ANALYSIS', FALSE),
('tag_analysis_002', '基本面分析', 'ANALYSIS', FALSE);

-- 初始化默认板块
INSERT IGNORE INTO boards (board_id, name, category, description, is_active) VALUES
('board_001', '综合讨论', 'GENERAL', '投资相关的综合讨论区', TRUE),
('board_002', '股票讨论', 'STOCKS', '股票投资讨论和分享', TRUE),
('board_003', '基金讨论', 'FUNDS', '基金投资讨论和分析', TRUE),
('board_004', '投资分析', 'ANALYSIS', '投资策略和分析分享', TRUE),
('board_005', '资讯速递', 'NEWS', '最新金融资讯和市场动态', TRUE),
('board_006', '问答中心', 'QUESTIONS', '投资相关问题解答', TRUE),
('board_007', '策略共享', 'STRATEGIES', '投资策略和技巧分享', TRUE);
