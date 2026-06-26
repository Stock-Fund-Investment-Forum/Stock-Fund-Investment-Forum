# 股票基金投资论坛 - 常用SQL查询示例

## 目录
1. [用户相关查询](#用户相关查询)
2. [内容相关查询](#内容相关查询)
3. [社区相关查询](#社区相关查询)
4. [投资信息查询](#投资信息查询)
5. [统计分析查询](#统计分析查询)
6. [管理员查询](#管理员查询)

---

## 用户相关查询

### 1. 获取用户详细信息
```sql
-- 获取单个用户的完整信息
SELECT u.*, 
       COUNT(DISTINCT uf1.follower_id) AS follower_count,
       COUNT(DISTINCT uf2.following_id) AS following_count
FROM users u
LEFT JOIN user_follows uf1 ON u.user_id = uf1.following_id
LEFT JOIN user_follows uf2 ON u.user_id = uf2.follower_id
WHERE u.user_id = 'xxxxx' AND u.is_deleted = FALSE
GROUP BY u.user_id;
```

### 2. 获取用户的认证信息
```sql
-- 获取用户最新的认证状态
SELECT * FROM authentication
WHERE user_id = 'xxxxx'
ORDER BY created_at DESC
LIMIT 5;
```

### 3. 用户等级排行榜
```sql
-- 按积分排序获取用户排行
SELECT user_id, nickname, level, points, influence_value
FROM users
WHERE is_deleted = FALSE
ORDER BY points DESC, influence_value DESC
LIMIT 100;
```

### 4. 获取用户的关注者和被关注者
```sql
-- 获取用户关注的人
SELECT u.* FROM users u
JOIN user_follows uf ON u.user_id = uf.following_id
WHERE uf.follower_id = 'xxxxx' AND u.is_deleted = FALSE;

-- 获取用户的粉丝
SELECT u.* FROM users u
JOIN user_follows uf ON u.user_id = uf.follower_id
WHERE uf.following_id = 'xxxxx' AND u.is_deleted = FALSE;
```

### 5. 获取用户未读私信和通知
```sql
-- 未读私信数
SELECT COUNT(*) AS unread_messages
FROM messages
WHERE recipient_id = 'xxxxx' AND is_read = FALSE AND is_deleted = FALSE;

-- 未读通知
SELECT * FROM notifications
WHERE user_id = 'xxxxx' AND is_read = FALSE
ORDER BY created_at DESC;
```

### 6. 检测账户异常
```sql
-- 查找被禁用的账户
SELECT * FROM users
WHERE status = 'BANNED' OR status = 'SUSPENDED'
ORDER BY updated_at DESC;

-- 查找有违规记录的用户
SELECT u.*, COUNT(v.violation_id) AS violation_count
FROM users u
LEFT JOIN violations v ON u.user_id = v.user_id AND v.status != 'RESOLVED'
WHERE v.violation_id IS NOT NULL
GROUP BY u.user_id;
```

---

## 内容相关查询

### 1. 获取帖子详细信息
```sql
-- 使用视图获取帖子详情（推荐）
SELECT * FROM v_post_details
WHERE post_id = 'xxxxx';

-- 或详细查询
SELECT p.*, 
       u.nickname, u.avatar, u.level,
       COUNT(DISTINCT c.comment_id) AS comment_count,
       COUNT(DISTINCT a.attachment_id) AS attachment_count,
       COALESCE(pv.total_votes, 0) AS poll_votes
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
LEFT JOIN attachments a ON p.post_id = a.post_id AND a.is_deleted = FALSE
LEFT JOIN (SELECT poll_id, SUM(vote_count) AS total_votes 
           FROM poll_options GROUP BY poll_id) pv ON p.post_id = pv.poll_id
WHERE p.post_id = 'xxxxx' AND p.is_deleted = FALSE
GROUP BY p.post_id;
```

### 2. 获取帖子的所有评论
```sql
-- 获取帖子的评论树（包括楼中楼）
SELECT * FROM comments
WHERE post_id = 'xxxxx' AND is_deleted = FALSE AND audit_status = 'APPROVED'
ORDER BY parent_comment_id, created_at ASC;

-- 递归查询评论树（MySQL 8.0+）
WITH RECURSIVE comment_tree AS (
    -- 基础查询：一级评论
    SELECT comment_id, post_id, parent_comment_id, user_id, content, 0 AS depth
    FROM comments
    WHERE post_id = 'xxxxx' AND parent_comment_id IS NULL AND is_deleted = FALSE
    
    UNION ALL
    
    -- 递归查询：子评论
    SELECT c.comment_id, c.post_id, c.parent_comment_id, c.user_id, c.content, ct.depth + 1
    FROM comments c
    JOIN comment_tree ct ON c.parent_comment_id = ct.comment_id
    WHERE c.is_deleted = FALSE AND ct.depth < 10
)
SELECT * FROM comment_tree
ORDER BY depth, created_at;
```

### 3. 获取帖子标签
```sql
-- 获取帖子的所有标签
SELECT t.* FROM tags t
JOIN post_tags pt ON t.tag_id = pt.tag_id
WHERE pt.post_id = 'xxxxx';
```

### 4. 获取帖子附件
```sql
-- 获取已批准的附件
SELECT * FROM attachments
WHERE post_id = 'xxxxx' 
  AND audit_status = 'APPROVED'
  AND is_deleted = FALSE
ORDER BY created_at DESC;
```

### 5. 获取帖子的投票信息
```sql
-- 获取投票和选项
SELECT p.*, po.option_id, po.text, po.vote_count
FROM polls p
LEFT JOIN poll_options po ON p.poll_id = po.poll_id
WHERE p.post_id = 'xxxxx'
ORDER BY po.display_order;

-- 获取用户的投票记录
SELECT po.*, pv.voted_at FROM poll_options po
LEFT JOIN poll_votes pv ON po.option_id = pv.option_id AND pv.user_id = 'xxxxx'
WHERE po.poll_id = 'xxxxx';
```

### 6. 搜索帖子
```sql
-- 全文搜索帖子
SELECT * FROM posts
WHERE is_deleted = FALSE 
  AND status = 'PUBLISHED'
  AND (title LIKE CONCAT('%', ?, '%') OR content LIKE CONCAT('%', ?, '%'))
ORDER BY created_at DESC
LIMIT 50;

-- 按板块和类型搜索
SELECT * FROM posts
WHERE board_id = 'xxxxx'
  AND post_type = 'ANALYSIS'
  AND is_deleted = FALSE
  AND status = 'PUBLISHED'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY view_count DESC, created_at DESC
LIMIT 20;
```

---

## 社区相关查询

### 1. 获取板块信息
```sql
-- 获取所有活跃板块
SELECT b.*, 
       COUNT(DISTINCT p.post_id) AS current_post_count,
       COUNT(DISTINCT bs.user_id) AS current_subscriber_count
FROM boards b
LEFT JOIN posts p ON b.board_id = p.board_id AND p.is_deleted = FALSE
LEFT JOIN board_subscriptions bs ON b.board_id = bs.board_id
WHERE b.is_active = TRUE
GROUP BY b.board_id
ORDER BY current_post_count DESC;
```

### 2. 获取板块的帖子列表
```sql
-- 获取某板块的最新帖子
SELECT p.*, u.nickname, u.avatar,
       COUNT(DISTINCT c.comment_id) AS comment_count
FROM posts p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
WHERE p.board_id = 'xxxxx'
  AND p.is_deleted = FALSE
  AND p.status = 'PUBLISHED'
  AND p.audit_status = 'APPROVED'
GROUP BY p.post_id
ORDER BY p.is_essence DESC, p.created_at DESC
LIMIT 20;
```

### 3. 获取用户订阅的板块
```sql
-- 获取用户订阅的所有板块
SELECT b.* FROM boards b
JOIN board_subscriptions bs ON b.board_id = bs.board_id
WHERE bs.user_id = 'xxxxx'
ORDER BY bs.subscribed_at DESC;
```

### 4. 获取用户加入的群组
```sql
-- 获取用户加入的群组和其角色
SELECT g.*, gm.role FROM groups g
JOIN group_memberships gm ON g.group_id = gm.group_id
WHERE gm.user_id = 'xxxxx'
ORDER BY gm.joined_at DESC;
```

### 5. 获取群组成员
```sql
-- 获取群组的所有成员
SELECT u.*, gm.role FROM users u
JOIN group_memberships gm ON u.user_id = gm.user_id
WHERE gm.group_id = 'xxxxx'
  AND u.is_deleted = FALSE
ORDER BY gm.role, u.level DESC;
```

### 6. 使用社区统计视图
```sql
-- 获取所有板块的统计数据
SELECT * FROM v_board_statistics
ORDER BY total_posts DESC;
```

---

## 投资信息查询

### 1. 获取股票信息
```sql
-- 获取热门股票
SELECT * FROM stock_infos
WHERE market = 'A_SHARE'
ORDER BY discussion_count DESC, last_updated DESC
LIMIT 50;

-- 搜索特定股票
SELECT * FROM stock_infos
WHERE symbol = 'xxxxx' OR name LIKE CONCAT('%', ?, '%');
```

### 2. 获取股票的实时讨论
```sql
-- 获取最新的讨论
SELECT rd.*, u.nickname, u.avatar, si.symbol, si.name
FROM realtime_discussions rd
JOIN users u ON rd.user_id = u.user_id
JOIN stock_infos si ON rd.stock_id = si.stock_id
WHERE rd.stock_id = 'xxxxx'
  AND rd.is_deleted = FALSE
ORDER BY rd.created_at DESC
LIMIT 50;

-- 获取看涨的讨论
SELECT rd.*, u.nickname
FROM realtime_discussions rd
JOIN users u ON rd.user_id = u.user_id
WHERE rd.stock_id = 'xxxxx'
  AND rd.sentiment = 'POSITIVE'
  AND rd.is_deleted = FALSE
ORDER BY rd.like_count DESC, rd.created_at DESC;
```

### 3. 获取用户的风险评估
```sql
-- 获取用户的最新评估
SELECT * FROM risk_assessments
WHERE user_id = 'xxxxx'
ORDER BY created_at DESC
LIMIT 1;
```

### 4. 获取股票的讨论热度趋势
```sql
-- 获取过去7天的讨论趋势
SELECT DATE(created_at) AS date,
       COUNT(*) AS discussion_count,
       SUM(CASE WHEN sentiment = 'POSITIVE' THEN 1 ELSE 0 END) AS positive_count,
       SUM(CASE WHEN sentiment = 'NEGATIVE' THEN 1 ELSE 0 END) AS negative_count
FROM realtime_discussions
WHERE stock_id = 'xxxxx'
  AND is_deleted = FALSE
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 统计分析查询

### 1. 用户活跃度分析
```sql
-- 使用活跃度视图
SELECT * FROM v_user_activity
ORDER BY last_activity_time DESC
LIMIT 100;

-- 活跃用户排行
SELECT user_id, nickname, 
       post_count + comment_count AS total_contribution,
       message_count
FROM v_user_activity
WHERE post_count > 0 OR comment_count > 0
ORDER BY total_contribution DESC, message_count DESC
LIMIT 50;
```

### 2. 内容热度分析
```sql
-- 最受欢迎的帖子
SELECT * FROM v_hot_posts
LIMIT 100;

-- 按浏览量排序的精华帖
SELECT * FROM posts
WHERE is_deleted = FALSE
  AND is_essence = TRUE
  AND status = 'PUBLISHED'
ORDER BY view_count DESC, like_count DESC;
```

### 3. 板块活跃度分析
```sql
-- 各板块的帖子发布趋势
SELECT DATE(created_at) AS date,
       board_id,
       COUNT(*) AS post_count
FROM posts
WHERE is_deleted = FALSE AND status = 'PUBLISHED'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), board_id
ORDER BY date DESC, post_count DESC;
```

### 4. 标签使用统计
```sql
-- 最受欢迎的标签
SELECT t.tag_id, t.name, t.category, COUNT(*) AS usage_count
FROM tags t
JOIN post_tags pt ON t.tag_id = pt.tag_id
JOIN posts p ON pt.post_id = p.post_id AND p.is_deleted = FALSE
WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY t.tag_id
ORDER BY usage_count DESC
LIMIT 50;
```

### 5. 用户获得的互动统计
```sql
-- 用户获得的总赞数
SELECT user_id, 
       COUNT(CASE WHEN engagement_type = 'LIKE' THEN 1 END) AS total_likes,
       COUNT(CASE WHEN engagement_type = 'SHARE' THEN 1 END) AS total_shares,
       COUNT(CASE WHEN engagement_type = 'BOOKMARK' THEN 1 END) AS total_bookmarks
FROM engagements
GROUP BY user_id
ORDER BY total_likes DESC;
```

### 6. 审核统计
```sql
-- 审核队列中的内容
SELECT content_type, status, COUNT(*) AS count
FROM audit_logs
WHERE status IN ('PENDING', 'FLAGGED')
GROUP BY content_type, status;

-- 风险最高的内容
SELECT * FROM audit_logs
WHERE status IN ('PENDING', 'FLAGGED')
ORDER BY risk_score DESC
LIMIT 100;
```

---

## 管理员查询

### 1. 用户管理
```sql
-- 查找可疑账户
SELECT u.*, 
       COUNT(DISTINCT v.violation_id) AS violation_count,
       MAX(v.created_at) AS latest_violation
FROM users u
LEFT JOIN violations v ON u.user_id = v.user_id
WHERE v.violation_id IS NOT NULL 
   OR u.status IN ('SUSPENDED', 'BANNED')
GROUP BY u.user_id
ORDER BY violation_count DESC, u.created_at ASC;

-- 找出最活跃的用户
SELECT u.user_id, u.nickname, u.level, u.points,
       COUNT(DISTINCT p.post_id) AS post_count,
       COUNT(DISTINCT c.comment_id) AS comment_count
FROM users u
LEFT JOIN posts p ON u.user_id = p.user_id AND p.is_deleted = FALSE
LEFT JOIN comments c ON u.user_id = c.user_id AND c.is_deleted = FALSE
GROUP BY u.user_id
ORDER BY post_count + comment_count DESC
LIMIT 50;
```

### 2. 内容审核
```sql
-- 待审核内容队列
SELECT * FROM audit_logs
WHERE status = 'PENDING'
ORDER BY risk_score DESC, created_at ASC
LIMIT 50;

-- 被标记为有风险的内容
SELECT * FROM audit_logs
WHERE status = 'FLAGGED'
ORDER BY risk_score DESC
LIMIT 50;

-- 审核通过率统计
SELECT content_type,
       COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) AS approved,
       COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) AS rejected,
       COUNT(*) AS total,
       ROUND(COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) * 100.0 / COUNT(*), 2) AS approval_rate
FROM audit_logs
GROUP BY content_type;
```

### 3. 违规管理
```sql
-- 待处理的违规案件
SELECT * FROM violations
WHERE status IN ('PENDING', 'APPEALED')
ORDER BY severity DESC, created_at ASC;

-- 重点监管用户
SELECT user_id, 
       COUNT(*) AS total_violations,
       MAX(severity) AS max_severity,
       MAX(created_at) AS latest_violation
FROM violations
GROUP BY user_id
HAVING COUNT(*) >= 3
ORDER BY total_violations DESC;

-- 检查禁言是否已结束
SELECT * FROM violations
WHERE end_time <= NOW() AND status = 'PROCESSED'
LIMIT 50;
```

### 4. 系统监控
```sql
-- 数据库表大小
SELECT table_name, 
       ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'stock_fund_forum'
ORDER BY size_mb DESC;

-- 慢查询统计
SHOW PROCESSLIST;  -- 实时连接

-- 活跃连接数
SELECT COUNT(*) AS connection_count FROM information_schema.processlist;
```

### 5. 数据备份和恢复
```sql
-- 导出数据用于备份
mysqldump -u root -p stock_fund_forum > backup.sql

-- 导入备份数据
mysql -u root -p stock_fund_forum < backup.sql

-- 导出特定表
mysqldump -u root -p stock_fund_forum users > users_backup.sql
```

---

## 常见业务场景查询

### 场景1：用户发布帖子流程
```sql
-- 1. 检查用户状态
SELECT status FROM users WHERE user_id = 'xxxxx';

-- 2. 检查用户是否被禁言
SELECT * FROM violations 
WHERE user_id = 'xxxxx' 
  AND status = 'PROCESSED'
  AND end_time > NOW();

-- 3. 插入新帖子
INSERT INTO posts (...) VALUES (...);

-- 4. 更新板块统计
UPDATE boards SET post_count = post_count + 1 WHERE board_id = 'xxxxx';
```

### 场景2：用户评论流程
```sql
-- 1. 获取帖子信息
SELECT * FROM posts WHERE post_id = 'xxxxx' AND is_deleted = FALSE;

-- 2. 插入评论
INSERT INTO comments (...) VALUES (...);

-- 3. 更新帖子的评论计数
UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = 'xxxxx';

-- 4. 创建通知
INSERT INTO notifications (...) VALUES (...);
```

### 场景3：用户点赞流程
```sql
-- 1. 检查是否已点赞
SELECT * FROM engagements 
WHERE user_id = 'xxxxx' 
  AND content_id = 'xxxxx'
  AND engagement_type = 'LIKE';

-- 2. 如果没有，插入点赞记录
INSERT INTO engagements (...) VALUES (...);

-- 3. 更新内容的点赞计数
UPDATE posts SET like_count = like_count + 1 WHERE post_id = 'xxxxx';
```

### 场景4：获取推荐内容
```sql
-- 根据用户关注推荐帖子
SELECT p.* FROM posts p
JOIN users creator ON p.user_id = creator.user_id
JOIN user_follows uf ON creator.user_id = uf.following_id
WHERE uf.follower_id = 'xxxxx'
  AND p.is_deleted = FALSE
  AND p.status = 'PUBLISHED'
  AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY p.like_count DESC, p.created_at DESC
LIMIT 20;

-- 根据标签推荐帖子
SELECT p.* FROM posts p
JOIN post_tags pt ON p.post_id = pt.post_id
WHERE pt.tag_id IN (SELECT tag_id FROM user_interest_tags WHERE user_id = 'xxxxx')
  AND p.is_deleted = FALSE
  AND p.status = 'PUBLISHED'
  AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY p.like_count DESC, p.created_at DESC
LIMIT 20;
```

---

## 性能优化建议

### 使用解释计划分析查询
```sql
EXPLAIN SELECT * FROM posts 
WHERE board_id = 'xxxxx' 
  AND status = 'PUBLISHED'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 常见优化技巧
1. **使用索引**：确保WHERE、JOIN、ORDER BY条件上有索引
2. **减少JOIN**：使用冗余字段或缓存避免多表JOIN
3. **分页查询**：使用LIMIT和OFFSET，或使用ID范围查询
4. **及时LIMIT**：在WHERE中尽可能限制数据集大小
5. **避免NULL比较**：用IS NULL而非 = NULL
