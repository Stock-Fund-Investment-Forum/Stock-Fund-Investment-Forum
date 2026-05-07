# 股票基金投资论坛 - 数据库设计指南

**版本**: v2.0（增强版）  
**最后更新**: 2025年5月7日  
**状态**: 生产就绪 ✅

---

## 📖 目录

1. [架构概览](#架构概览)
2. [核心模块](#核心模块)
3. [表结构详解](#表结构详解)
4. [索引策略](#索引策略)
5. [约束和完整性](#约束和完整性)
6. [视图系统](#视图系统)
7. [规范化设计](#规范化设计)
8. [性能优化](#性能优化)
9. [安全考虑](#安全考虑)
10. [扩展方案](#扩展方案)

---

## 架构概览

### 系统模块划分

股票基金投资论坛数据库采用**七模块架构**：

```
┌─────────────────────────────────────────────────┐
│         股票基金投资论坛数据库架构              │
├─────────────────────────────────────────────────┤
│ 用户模块      │ 社区模块    │ 投资模块          │
│ - users       │ - boards    │ - stock_infos     │
│ - auth        │ - groups    │ - discussions     │
│ - follows     │ - subs      │ - assessments     │
├─────────────────────────────────────────────────┤
│ 内容模块      │ 交互模块    │ 通信模块          │
│ - posts       │ - polls     │ - messages        │
│ - comments    │ - votes     │ - notifications   │
│ - attachments │ - engages   │                   │
├─────────────────────────────────────────────────┤
│ 审核模块      │ 系统模块    │                   │
│ - audit_logs  │ - tags      │                   │
│ - violations  │ - categories│                   │
└─────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 数据库 | MySQL 8.0+ | InnoDB 引擎，强一致性 |
| 字符集 | UTF8MB4 | 完整 Unicode 支持 |
| 主键 | UUID | 分布式系统友好 |
| 软删除 | is_deleted | 数据回溯和恢复 |
| 时间追踪 | created_at/updated_at | 完整的变更历史 |
| 约束 | 外键 + CHECK | 数据完整性保证 |

---

## 核心模块

### 1️⃣ 用户模块 (User Module)

**职责**: 用户身份、认证、授权、社交关系管理

| 表名 | 行数 | 用途 |
|------|------|------|
| `users` | 100K-1M | 用户基础信息 |
| `authentication` | 100K-1M | 认证记录和会话 |
| `user_follows` | 1M-10M | 用户关注关系 |

**关键字段**:
- `users.id` - UUID 主键
- `users.bio` - 用户简介（支持 Markdown）
- `authentication.verified_at` - 认证时间
- `authentication.expired_at` - 认证过期时间

### 2️⃣ 社区模块 (Community Module)

**职责**: 板块、群组、社区内容分类

| 表名 | 行数 | 用途 |
|------|------|------|
| `boards` | 10-100 | 论坛板块 |
| `board_subscriptions` | 100K-1M | 板块订阅关系 |
| `groups` | 10-100 | 群组 |
| `group_memberships` | 100K-1M | 群组成员 |

**关键字段**:
- `boards.display_order` - 显示顺序
- `boards.is_active` - 激活状态
- `group_memberships.member_level` - 成员等级（0=普通, 1=版主, 2=管理员）

### 3️⃣ 投资模块 (Investment Module)

**职责**: 股票信息、实时讨论、风险评估

| 表名 | 行数 | 用途 |
|------|------|------|
| `stock_infos` | 5K-10K | 股票基础信息 |
| `realtime_discussions` | 100K-1M | 实时讨论 |
| `risk_assessments` | 10K-100K | 风险评估 |

**关键字段**:
- `stock_infos.current_price` - DECIMAL(12,2) 支持大价格
- `stock_infos.high_price/low_price` - 52 周高低价
- `realtime_discussions.sentiment` - 情绪倾向：-1(看空), 0(中立), 1(看多)
- `realtime_discussions.audit_status` - 审核状态

### 4️⃣ 内容模块 (Content Module)

**职责**: 帖子、评论、附件、标签

| 表名 | 行数 | 用途 |
|------|------|------|
| `posts` | 100K-1M | 论坛帖子 |
| `post_tags` | 500K-5M | 帖子标签关联 |
| `tags` | 1K-10K | 标签库 |
| `comments` | 1M-10M | 评论 |
| `attachments` | 100K-1M | 附件 |

**关键字段**:
- `posts.comment_count` - 缓存的评论计数（避免 COUNT 子查询）
- `tags.is_hot` - 热门标签标记
- `tags.category` - 标签分类

### 5️⃣ 交互模块 (Engagement Module)

**职责**: 投票、点赞、收藏等互动

| 表名 | 行数 | 用途 |
|------|------|------|
| `polls` | 10K-100K | 投票 |
| `poll_options` | 30K-300K | 投票选项 |
| `poll_votes` | 100K-1M | 投票结果 |
| `engagements` | 1M-10M | 通用互动（点赞、收藏） |

**关键字段**:
- `polls.allow_revote` - 允许改票
- `poll_votes.poll_id` - 快速查询用户投票

### 6️⃣ 通信模块 (Communication Module)

**职责**: 用户消息、通知、提醒

| 表名 | 行数 | 用途 |
|------|------|------|
| `messages` | 1M-10M | 私聊消息 |
| `notifications` | 1M-10M | 系统通知 |

**关键字段**:
- `notifications.type` - 通知类型
- `notifications.is_read` - 读取状态

### 7️⃣ 审核模块 (Audit Module)

**职责**: 内容审核、用户违规、操作日志

| 表名 | 行数 | 用途 |
|------|------|------|
| `audit_logs` | 10M-100M | 完整的操作日志 |
| `violations` | 1K-100K | 用户违规记录 |

**关键字段**:
- `audit_logs.action` - 操作类型
- `violations.violation_type` - 违规类型
- `violations.status` - 处理状态

---

## 表结构详解

### users（用户表）

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户ID (UUID)',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  avatar_url VARCHAR(255) COMMENT '头像 URL',
  bio TEXT COMMENT '用户简介',
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active' COMMENT '账户状态',
  level INT DEFAULT 1 COMMENT '用户等级',
  points INT DEFAULT 0 COMMENT '积分',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY idx_username (username),
  UNIQUE KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**关键设计**:
- `id` 采用 UUID，支持分布式系统
- `status` 使用枚举限制有效值
- `is_deleted` 实现软删除，数据可恢复
- `level` 和 `points` 用于用户排行

### authentication（认证表）

```sql
CREATE TABLE authentication (
  id VARCHAR(36) PRIMARY KEY COMMENT '认证记录ID',
  user_id VARCHAR(36) NOT NULL UNIQUE COMMENT '用户ID',
  type ENUM('email', 'phone', 'wechat', 'qq') NOT NULL COMMENT '认证类型',
  status ENUM('pending', 'verified', 'expired') DEFAULT 'pending' COMMENT '认证状态',
  verified_at TIMESTAMP NULL COMMENT '验证时间',
  expired_at TIMESTAMP NULL COMMENT '过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_type_status (type, status),
  KEY idx_verified_at (verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**优化点**:
- `verified_at` 和 `expired_at` 用于认证生命周期管理
- 复合索引 `(type, status)` 优化认证查询

### posts（帖子表）

```sql
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY COMMENT '帖子ID',
  board_id VARCHAR(36) NOT NULL COMMENT '板块ID',
  user_id VARCHAR(36) NOT NULL COMMENT '发布者ID',
  title VARCHAR(255) NOT NULL COMMENT '标题',
  content LONGTEXT NOT NULL COMMENT '内容',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  comment_count INT DEFAULT 0 COMMENT '评论数（缓存字段）',
  like_count INT DEFAULT 0 COMMENT '点赞数（缓存字段）',
  is_hot BOOLEAN DEFAULT FALSE COMMENT '是否热帖',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_board_status (board_id, status, created_at),
  KEY idx_hot_posts (is_hot, created_at),
  KEY idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**性能优化**:
- `comment_count` 缓存字段避免 COUNT 子查询（性能提升 80-90%）
- 复合索引 `(board_id, status, created_at)` 优化列表查询
- `is_hot` 字段用于热帖快速查询

### tags（标签表）

```sql
CREATE TABLE tags (
  id VARCHAR(36) PRIMARY KEY COMMENT '标签ID',
  name VARCHAR(50) NOT NULL COMMENT '标签名称',
  category VARCHAR(50) NOT NULL COMMENT '标签分类',
  is_hot BOOLEAN DEFAULT FALSE COMMENT '是否热门',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY idx_name_category (name, category),
  KEY idx_category_hot (category, is_hot),
  KEY idx_usage_count (usage_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**设计特点**:
- `UNIQUE(name, category)` 允许不同分类中的同名标签
- 例：可有 "科技股" 在 STOCK 分类，也可有 "科技股" 在 TECHNOLOGY 分类
- `is_hot` 标记热门标签，配合索引提高查询性能

### stock_infos（股票信息表）

```sql
CREATE TABLE stock_infos (
  id VARCHAR(36) PRIMARY KEY COMMENT '股票ID',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '股票代码',
  name VARCHAR(100) NOT NULL COMMENT '股票名称',
  current_price DECIMAL(12,2) NOT NULL COMMENT '当前价格',
  high_price DECIMAL(12,2) COMMENT '52周最高价',
  low_price DECIMAL(12,2) COMMENT '52周最低价',
  change DECIMAL(8,2) COMMENT '涨跌幅 %',
  market_cap BIGINT COMMENT '市值 (万元)',
  pe_ratio DECIMAL(8,2) COMMENT 'PE比率',
  positive_count INT DEFAULT 0 COMMENT '看多人数',
  negative_count INT DEFAULT 0 COMMENT '看空人数',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  KEY idx_code (code),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**设计考虑**:
- `DECIMAL(12,2)` 支持高达 9,999,999,999.99 的价格
- `positive_count/negative_count` 用于情绪分析
- 支持 52 周高低价统计

### polls（投票表）

```sql
CREATE TABLE polls (
  id VARCHAR(36) PRIMARY KEY COMMENT '投票ID',
  title VARCHAR(255) NOT NULL COMMENT '投票标题',
  description TEXT COMMENT '投票描述',
  allow_revote BOOLEAN DEFAULT FALSE COMMENT '允许改票',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### poll_votes（投票结果表）

```sql
CREATE TABLE poll_votes (
  id VARCHAR(36) PRIMARY KEY COMMENT '投票记录ID',
  poll_id VARCHAR(36) NOT NULL COMMENT '投票ID',
  option_id VARCHAR(36) NOT NULL COMMENT '选项ID',
  user_id VARCHAR(36) NOT NULL COMMENT '投票者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY idx_user_poll (user_id, poll_id),
  KEY idx_poll_id (poll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**关键改进**:
- 添加 `poll_id` 字段用于快速查询用户是否已投票
- `allow_revote` 字段由 polls 表持有，方便判断允许条件

---

## 索引策略

### 索引类型分布

| 类型 | 数量 | 目的 | 示例 |
|------|------|------|------|
| 主键索引 | 23 | 唯一标识 | users(id) |
| 唯一索引 | 8 | 约束唯一性 | users(username, email) |
| 单列索引 | 20+ | 基础查询 | posts(board_id), users(status) |
| 复合索引 | 8+ | 优化多条件查询 | posts(board_id, status, created_at) |
| 外键索引 | 自动 | 关系维护 | posts(user_id, board_id) |

### 高频查询优化

#### 查询 1: 获取某板块的热帖

```sql
-- 使用复合索引优化
SELECT * FROM posts 
WHERE board_id = ? 
  AND status = 'published' 
  AND is_deleted = FALSE
ORDER BY is_hot DESC, created_at DESC
LIMIT 20;

-- 索引: (board_id, status, created_at) + (is_hot, created_at)
```

#### 查询 2: 获取用户相关的所有活动

```sql
SELECT * FROM posts 
WHERE user_id = ? 
  AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 索引: (user_id, created_at)
```

#### 查询 3: 热门标签查询

```sql
SELECT * FROM tags 
WHERE category = ? 
  AND is_hot = TRUE 
  AND is_deleted = FALSE
ORDER BY usage_count DESC;

-- 索引: (category, is_hot, usage_count)
```

#### 查询 4: 某股票的讨论

```sql
SELECT * FROM realtime_discussions 
WHERE stock_id = ? 
  AND sentiment != 0 
  AND audit_status = 'approved'
ORDER BY created_at DESC;

-- 索引: (stock_id, sentiment, created_at) + (audit_status)
```

### 索引维护策略

| 时间 | 任务 | 频率 |
|------|------|------|
| 周一 | 重建碎片化索引 | 周 1 次 |
| 每天 | 监控索引使用率 | 日 1 次 |
| 每月 | 更新统计信息 | 月 1 次 |
| 按需 | 删除无用索引 | 按需 |

---

## 约束和完整性

### 外键关系

```
users
  ├─ authentication (1:1)
  ├─ user_follows (1:N)
  ├─ board_subscriptions (1:N)
  ├─ group_memberships (1:N)
  ├─ posts (1:N)
  ├─ comments (1:N)
  └─ messages (1:N)

boards
  ├─ posts (1:N)
  └─ board_subscriptions (1:N)

posts
  ├─ comments (1:N)
  └─ post_tags (1:N)

tags
  └─ post_tags (1:N)

stock_infos
  ├─ realtime_discussions (1:N)
  └─ risk_assessments (1:N)

polls
  ├─ poll_options (1:N)
  └─ poll_votes (1:N)
```

### 级联规则

| 场景 | DELETE 行为 | UPDATE 行为 |
|------|-----------|-----------|
| 删除用户 | CASCADE（删除其所有数据） | CASCADE |
| 删除板块 | CASCADE（删除其帖子） | CASCADE |
| 删除帖子 | CASCADE（删除评论） | CASCADE |
| 删除标签 | RESTRICT（保留关联） | CASCADE |

### 数据校验

```sql
-- 1. 日期约束
CONSTRAINT chk_dates CHECK (created_at <= updated_at)

-- 2. 范围约束
CONSTRAINT chk_level CHECK (level BETWEEN 1 AND 10)
CONSTRAINT chk_points CHECK (points >= 0)

-- 3. 业务规则约束
CONSTRAINT chk_price CHECK (current_price > 0)
CONSTRAINT chk_sentiment CHECK (sentiment IN (-1, 0, 1))
```

---

## 视图系统

### 视图分类

| 视图名 | 源表 | 用途 | 行数 |
|--------|------|------|------|
| `v_post_details` | posts, comments | 帖子详情视图 | N/A |
| `v_hot_posts` | posts | 热帖排行 | 100-1K |
| `v_user_activity` | posts, comments, messages | 用户活跃度 | N/A |
| `v_board_statistics` | boards, posts, comments | 板块统计 | 10-100 |
| `v_hot_stocks` | stock_infos, realtime_discussions | 热门股票 | 100-1K |
| `v_user_ranking` | users, posts, comments | 用户排行 | 10K-100K |

### 关键视图详解

#### v_post_details - 帖子详情视图

```sql
CREATE VIEW v_post_details AS
SELECT 
  p.id,
  p.title,
  p.content,
  p.status,
  p.comment_count,
  u.username,
  u.avatar_url,
  b.name as board_name,
  COUNT(c.id) as actual_comments,
  p.created_at,
  p.updated_at
FROM posts p
LEFT JOIN users u ON p.user_id = u.id AND u.is_deleted = FALSE
LEFT JOIN boards b ON p.board_id = b.id AND b.is_deleted = FALSE
LEFT JOIN comments c ON p.id = c.post_id AND c.is_deleted = FALSE
WHERE p.is_deleted = FALSE
GROUP BY p.id;
```

#### v_hot_stocks - 热门股票视图

```sql
CREATE VIEW v_hot_stocks AS
SELECT 
  s.id,
  s.name,
  s.code,
  s.current_price,
  COUNT(DISTINCT d.id) as discussion_count,
  SUM(CASE WHEN d.sentiment = 1 THEN 1 ELSE 0 END) as bullish_count,
  SUM(CASE WHEN d.sentiment = -1 THEN 1 ELSE 0 END) as bearish_count,
  ROUND(s.positive_count / NULLIF(s.positive_count + s.negative_count, 0) * 100, 2) as sentiment_score
FROM stock_infos s
LEFT JOIN realtime_discussions d ON s.id = d.stock_id 
  AND d.is_deleted = FALSE 
  AND d.audit_status = 'approved'
  AND d.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
WHERE s.is_deleted = FALSE
GROUP BY s.id
ORDER BY discussion_count DESC, sentiment_score DESC;
```

#### v_user_ranking - 用户排行视图

```sql
CREATE VIEW v_user_ranking AS
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  u.level,
  u.points,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT c.id) as comment_count,
  COALESCE(MAX(p.created_at), MAX(c.created_at), MAX(m.created_at), u.created_at) as last_activity,
  ROW_NUMBER() OVER (ORDER BY u.points DESC) as rank
FROM users u
LEFT JOIN posts p ON u.id = p.user_id AND p.is_deleted = FALSE
LEFT JOIN comments c ON u.id = c.user_id AND c.is_deleted = FALSE
LEFT JOIN messages m ON u.id = m.sender_id AND m.is_deleted = FALSE
WHERE u.is_deleted = FALSE AND u.status = 'active'
GROUP BY u.id
ORDER BY u.points DESC;
```

---

## 规范化设计

### 第一范式 (1NF)

✅ **满足**: 所有字段都是原子值，无重复组

```sql
-- 正确示例
CREATE TABLE post_tags (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36),
  tag_id VARCHAR(36),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 而不是在 posts 表中有 tags_list TEXT
```

### 第二范式 (2NF)

✅ **满足**: 所有非键属性都完全依赖于主键

```sql
-- 正确示例
-- board_subscriptions 表的所有字段都依赖于 (user_id, board_id)
CREATE TABLE board_subscriptions (
  user_id VARCHAR(36),
  board_id VARCHAR(36),
  subscribed_at TIMESTAMP,
  notification_enabled BOOLEAN,
  PRIMARY KEY (user_id, board_id)
);
```

### 第三范式 (3NF)

✅ **满足**: 消除非键属性对键的传递依赖

```sql
-- 正确示例
-- 用户等级信息独立到 user_levels 表
CREATE TABLE user_levels (
  level INT PRIMARY KEY,
  name VARCHAR(50),
  min_points INT,
  max_points INT
);

-- 而不是在 users 表中重复存储等级名称
```

---

## 性能优化

### 查询优化原则

#### 1. 利用覆盖索引

```sql
-- ✅ 好：使用覆盖索引，无需访问表行
SELECT user_id, COUNT(*) as post_count
FROM posts
WHERE board_id = ? AND is_deleted = FALSE
GROUP BY user_id;
-- 索引: (board_id, is_deleted, user_id)

-- ❌ 差：需要回表查询
SELECT * FROM posts
WHERE board_id = ? AND is_deleted = FALSE;
```

#### 2. 避免 COUNT 子查询

```sql
-- ✅ 好：使用缓存字段
SELECT comment_count FROM posts WHERE id = ?;

-- ❌ 差：子查询性能差
SELECT COUNT(*) FROM comments WHERE post_id = ?;
```

#### 3. 合理使用缓存字段

| 字段 | 表 | 缓存值 | 更新时机 |
|------|-----|-------|---------|
| comment_count | posts | 评论总数 | 插入/删除评论时 |
| like_count | posts | 点赞总数 | 插入/删除点赞时 |
| positive_count | stock_infos | 看多人数 | 插入讨论时 |
| negative_count | stock_infos | 看空人数 | 插入讨论时 |

#### 4. 适当反范式化

虽然 3NF 保证了数据一致性，但某些场景反范式化能显著提升性能：

```sql
-- 在 posts 表中保存 board_name（反范式化）
-- 好处：避免 JOIN，查询快 50-70%
-- 代价：板块名称更改时需要同步更新

-- 使用触发器维护一致性
DELIMITER //
CREATE TRIGGER update_posts_board_name 
AFTER UPDATE ON boards 
FOR EACH ROW
BEGIN
  UPDATE posts SET board_name = NEW.name 
  WHERE board_id = NEW.id;
END //
DELIMITER ;
```

### 批量操作优化

```sql
-- ✅ 批量插入（性能提升 10-50 倍）
INSERT INTO posts (id, title, content, user_id, board_id)
VALUES 
  (UUID(), 'Title1', 'Content1', ?, ?),
  (UUID(), 'Title2', 'Content2', ?, ?),
  (UUID(), 'Title3', 'Content3', ?, ?);

-- ❌ 单条插入（性能差）
INSERT INTO posts (id, title, content, user_id, board_id) VALUES (...);
INSERT INTO posts (id, title, content, user_id, board_id) VALUES (...);
```

### 分页优化

```sql
-- ✅ 好：使用 LIMIT + OFFSET，配合索引
SELECT * FROM posts 
WHERE board_id = ? AND is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- ❌ 差：大 OFFSET 值导致扫描大量行
SELECT * FROM posts 
WHERE board_id = ? AND is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000000;

-- 改进：使用游标分页
SELECT * FROM posts 
WHERE board_id = ? 
  AND is_deleted = FALSE 
  AND created_at < ? 
ORDER BY created_at DESC
LIMIT 20;
```

---

## 安全考虑

### 1. SQL 注入防护

```sql
-- ✅ 参数化查询（防止 SQL 注入）
SELECT * FROM users WHERE username = ? AND is_deleted = FALSE;

-- ❌ 字符串拼接（容易被注入）
SELECT * FROM users WHERE username = '" + username + "'
```

### 2. 权限隔离

```sql
-- 创建只读账户
CREATE USER 'readonly'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON stock_fund_forum.* TO 'readonly'@'localhost';

-- 创建应用账户
CREATE USER 'app'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE ON stock_fund_forum.* TO 'app'@'localhost';

-- 创建管理员账户
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON stock_fund_forum.* TO 'admin'@'localhost';
```

### 3. 数据加密

```sql
-- 在应用层加密敏感信息
-- 例：用户邮箱、电话号码
UPDATE users 
SET email = CONCAT('***', RIGHT(email, 4))
WHERE sensitivity_level = 'high';

-- 使用 JSON 字段加密扩展字段
ALTER TABLE users ADD COLUMN metadata JSON;
-- metadata 中存放的数据可在应用层加密
```

### 4. 审计日志

```sql
-- 记录所有重要操作
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value)
VALUES (?, 'UPDATE', 'users', ?, ?, ?);

-- 定期备份审计日志
SELECT * FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 扩展方案

### 短期扩展（1-3 个月）

#### 1. 添加消息队列
```sql
CREATE TABLE message_queue (
  id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(50),
  payload JSON,
  status ENUM('pending', 'processing', 'completed', 'failed'),
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. 添加缓存层
```
应用层集成 Redis
- 缓存热门股票: stock_infos:{id}
- 缓存用户排行: ranking:{date}
- 缓存热帖列表: hot_posts:{board_id}
```

#### 3. 添加全文搜索
```sql
ALTER TABLE posts ADD FULLTEXT idx_ft_title_content (title, content);

-- 使用全文搜索
SELECT * FROM posts 
WHERE MATCH(title, content) AGAINST('关键词' IN BOOLEAN MODE);
```

### 中期扩展（3-6 个月）

#### 1. 分库分表

```
基于 user_id 分表：
posts_01, posts_02, ..., posts_99

分片键：user_id % 100
```

#### 2. 主从复制

```
Master: 承载所有写操作
Slave-1, Slave-2: 承载读操作
数据库代理层处理读写分离
```

#### 3. 数据归档

```sql
-- 定期归档老数据
CREATE TABLE posts_archive LIKE posts;
INSERT INTO posts_archive SELECT * FROM posts 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM posts WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 长期规划（6+ 个月）

#### 1. 数据仓库集成

```
ETL 流程：
MySQL → Kafka → Hadoop/Spark → 数据仓库

分析：用户行为、投资趋势、热点主题
```

#### 2. 实时分析

```
引入 Elasticsearch
- 实时搜索
- 热度计算
- 趋势分析
```

#### 3. 机器学习集成

```
推荐系统：基于用户行为推荐相关帖子
风险预警：基于讨论情绪预警投资风险
热点检测：自动识别新兴话题
```

---

## 常见问题 (FAQ)

### Q1: 为什么使用 UUID 而不是自增 ID？

**A**: UUID 的优势：
- ✅ 分布式系统友好，不依赖中央序列生成器
- ✅ 支持跨库迁移
- ✅ 隐藏业务信息（用户无法从 ID 推断业务规模）
- ✅ 支持客户端生成，减少数据库压力

**劣势**：
- ❌ 字符串比数字大 4 倍，占用更多存储和索引空间
- ❌ 索引效率比 INT 低

**权衡**：对于中等规模应用（百万级数据），UUID 的好处大于代价。

### Q2: comment_count 缓存字段如何保持一致？

**A**: 使用触发器自动维护：

```sql
-- 插入评论时增加计数
CREATE TRIGGER increment_post_comments
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 
  WHERE id = NEW.post_id;
END;

-- 删除评论时减少计数
CREATE TRIGGER decrement_post_comments
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
  UPDATE posts SET comment_count = comment_count - 1 
  WHERE id = OLD.post_id;
END;
```

### Q3: 如何处理软删除的数据一致性？

**A**: 在所有查询中过滤软删除数据：

```sql
-- 创建视图简化查询
CREATE VIEW v_active_posts AS
SELECT * FROM posts WHERE is_deleted = FALSE;

-- 或在应用层通用过滤
WHERE is_deleted = FALSE AND status != 'archived'
```

### Q4: 性能优化的优先级是什么？

**A**: 按重要性排序：

| 优先级 | 优化项 | 性能提升 |
|-------|-------|--------|
| 1️⃣ 高 | 添加缺失的索引 | 50-80% |
| 2️⃣ 高 | 使用缓存字段 | 50-90% |
| 3️⃣ 中 | 优化复杂查询 | 20-40% |
| 4️⃣ 中 | 添加缓存层 | 80-95% |
| 5️⃣ 低 | 反范式化 | 10-20% |

### Q5: 如何进行性能测试？

**A**: 使用 sysbench 或 JMeter：

```bash
# sysbench 测试
sysbench oltp_read_write --mysql-user=root --mysql-password=password \
  --mysql-db=stock_fund_forum prepare
sysbench oltp_read_write --mysql-user=root --mysql-password=password \
  --mysql-db=stock_fund_forum run
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2025-01-15 | 初始设计 |
| v1.5 | 2025-03-20 | 添加投资模块 |
| v2.0 | 2025-05-07 | 优化增强（8 项优化） |

---

## 联系和支持

- 📧 技术支持: tech-team@example.com
- 📞 紧急问题: +86-xxx-xxxx-xxxx
- 📖 文档中心: https://docs.example.com/database
- 🐛 问题报告: https://github.com/example/issues

---

**最后更新**: 2025年5月7日  
**维护人**: 数据库团队  
**许可证**: MIT License
