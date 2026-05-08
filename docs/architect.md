# 股票基金投资论坛 - 类设计文档

## 1. 用户类 (User)

### 属性
- `userId`: string - 用户唯一ID
- `nickname`: string - 昵称
- `avatar`: string - 头像URL
- `bio`: string - 个人简介
- `phone`: string - 手机号（可空）
- `email`: string - 邮箱（可空）
- `investmentTags`: string[] - 投资经验标签
- `focusAreas`: string[] - 关注领域（A股/港股/美股/基金等）
- `riskPreference`: string - 风险偏好
- `postCount`: number - 发帖数
- `essencePostCount`: number - 精华帖数
- `influence`: number - 影响力值
- `level`: number - 用户等级
- `points`: number - 积分
- `badges`: string[] - 荣誉勋章
- `authLevel`: enum - 认证等级（基础/实名/专业）
- `status`: enum - 账户状态（正常/冻结/禁用）
- `privacySettings`: object - 隐私设置
- `createdAt`: Date - 注册时间
- `updatedAt`: Date - 更新时间
- `isDeleted`: boolean - 是否已删除（软删除）

### 操作
- `register(phone|email|thirdParty)` - 注册账户
- `login(credentials)` - 登录
- `logout()` - 登出
- `authenticate(type)` - 完成认证（基础/实名/专业）
- `updateProfile(info)` - 更新个人资料
- `setPrivacy(settings)` - 设置隐私控制
- `follow(userId)` - 关注用户
- `unfollow(userId)` - 取消关注
- `addToStarred(userId)` - 添加到特别关注
- `removeFromStarred(userId)` - 移除特别关注
- `getFollowingList()` - 获取关注列表
- `getFollowerList()` - 获取粉丝列表
- `earnPoints(action, amount)` - 获取积分
- `deductPoints(amount, reason)` - 扣除积分
- `levelUp()` - 检查是否升级
- `getProfile(userId)` - 获取用户资料（支持隐私控制）
- `softDelete()` - 软删除账户

---

## 2. 帖子类 (Post)

### 属性
- `postId`: string - 帖子唯一ID
- `userId`: string - 发布者ID
- `title`: string - 标题
- `content`: string - 内容
- `postType`: enum - 帖子类型（普通/长文/投票/讨论）
- `boardId`: string - 所属板块ID
- `tags`: string[] - 标签
- `images`: string[] - 图片URL列表
- `attachments`: object[] - 附件（PDF、Excel等）
- `status`: enum - 状态（草稿/已发布/已删除）
- `auditStatus`: enum - 审核状态（待审核/已通过/已驳回）
- `auditReason`: string - 驳回原因（可空）
- `likeCount`: number - 点赞数
- `collectCount`: number - 收藏数
- `shareCount`: number - 转发数
- `commentCount`: number - 评论数
- `viewCount`: number - 浏览数
- `isEssence`: boolean - 是否精华帖
- `essenceReason`: string - 精华原因（可空）
- `createdAt`: Date - 发布时间
- `updatedAt`: Date - 更新时间
- `isDeleted`: boolean - 是否已删除（软删除）
- `deletedAt`: Date - 删除时间（可空）

### 操作
- `create(data)` - 创建帖子（草稿状态）
- `publish()` - 发布帖子（触发审核）
- `edit(data)` - 编辑帖子（仅草稿/已通过状态）
- `delete()` - 软删除帖子
- `hardDelete()` - 硬删除帖子（管理员）
- `like(userId)` - 点赞
- `unlike(userId)` - 取消点赞
- `collect(userId)` - 收藏
- `uncollect(userId)` - 取消收藏
- `share()` - 转发
- `addComment(comment)` - 发布评论
- `getComments(page, sort)` - 获取评论列表
- `markAsEssence(reason)` - 标记为精华
- `removeEssence()` - 移除精华标签
- `getEngagementStats()` - 获取互动统计
- `getLikers(page)` - 获取点赞用户列表
- `getCollectors(page)` - 获取收藏用户列表

---

## 3. 评论类 (Comment)

### 属性
- `commentId`: string - 评论唯一ID
- `postId`: string - 所属帖子ID
- `parentCommentId`: string - 父评论ID（可空，用于楼中楼）
- `userId`: string - 评论者ID
- `content`: string - 评论内容
- `mentions`: string[] - @提及的用户ID列表
- `status`: enum - 状态（正常/已删除）
- `auditStatus`: enum - 审核状态（待审核/已通过/已驳回）
- `auditReason`: string - 驳回原因（可空）
- `likeCount`: number - 点赞数
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间
- `isDeleted`: boolean - 是否已删除（软删除）
- `deletedAt`: Date - 删除时间（可空）

### 操作
- `create(postId, content, mentions, parentCommentId)` - 发布评论（触发审核）
- `edit(content)` - 编辑评论（仅已通过状态）
- `delete()` - 软删除评论
- `like(userId)` - 点赞评论
- `unlike(userId)` - 取消点赞
- `reply(content, mentions)` - 回复评论（楼中楼）
- `getReplies(page)` - 获取回复列表
- `getReplyCount()` - 获取回复总数
- `getLikers(page)` - 获取点赞用户列表

---

## 4. 板块类 (Board/Forum)

### 属性
- `boardId`: string - 板块唯一ID
- `name`: string - 板块名称
- `description`: string - 板块描述
- `category`: enum - 板块分类
- `icon`: string - 板块图标
- `moderators`: string[] - 版主ID列表
- `postCount`: number - 帖子总数
- `memberCount`: number - 成员总数
- `isActive`: boolean - 是否激活
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### 操作
- `create(data)` - 创建板块
- `edit(data)` - 编辑板块
- `delete()` - 删除板块
- `addModerator(userId)` - 添加版主
- `removeModerator(userId)` - 移除版主
- `getPosts(page, sort)` - 获取板块内帖子列表（支持多种排序）
- `getHotTopics(period)` - 获取热门话题
- `subscribe(userId)` - 订阅板块
- `unsubscribe(userId)` - 取消订阅
- `getSubscriberCount()` - 获取订阅人数
- `getNewPostCount(since)` - 获取新帖数量

---

## 5. 群组类 (Group)

### 属性
- `groupId`: string - 群组唯一ID
- `name`: string - 群组名称
- `description`: string - 群组描述
- `ownerId`: string - 所有者ID
- `memberCount`: number - 成员数
- `accessLevel`: enum - 权限等级（公开/私密/审核）
- `members`: string[] - 成员ID列表
- `pendingMembers`: string[] - 待审核成员ID列表
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### 操作
- `create(data)` - 创建群组
- `edit(data)` - 编辑群组
- `delete()` - 删除群组
- `addMember(userId)` - 添加成员
- `removeMember(userId)` - 移除成员
- `requestJoin(userId)` - 请求加入（仅用于审核群组）
- `approveJoinRequest(userId)` - 审核加入请求
- `rejectJoinRequest(userId)` - 拒绝加入请求
- `getPendingRequests(page)` - 获取待审核请求列表
- `shareDocument(file, description)` - 分享资料
- `getDocuments(page)` - 获取群组资料列表
- `promoteMember(userId)` - 提升为管理员
- `demoteMember(userId)` - 降为普通成员
- `getMembers(page)` - 获取成员列表

---

## 6. 私信类 (Message)

### 属性
- `messageId`: string - 私信唯一ID
- `senderId`: string - 发送者ID
- `recipientId`: string - 接收者ID
- `content`: string - 内容
- `type`: enum - 类型（文本/图片/文件）
- `attachments`: string[] - 附件URL列表
- `isRead`: boolean - 是否已读
- `readAt`: Date - 已读时间（可空）
- `createdAt`: Date - 创建时间
- `isDeleted`: boolean - 是否已删除（软删除）
- `deletedAt`: Date - 删除时间（可空）

### 操作
- `send(recipientId, content, attachments)` - 发送私信
- `markAsRead()` - 标记为已读
- `delete()` - 软删除私信
- `recall()` - 撤回私信（24小时内）
- `getConversation(userId, page)` - 获取与指定用户的对话列表
- `getUnreadCount()` - 获取未读私信数
- `getUnreadMessages(page)` - 获取未读私信列表

---

## 7. 认证日志类 (Authentication)

### 属性
- `authId`: string - 认证记录ID
- `userId`: string - 用户ID
- `type`: enum - 认证类型（基础/实名/专业）
- `status`: enum - 状态（待审核/已通过/已拒绝/已过期）
- `credentials`: object - 认证凭证
- `verificationMethod`: string - 验证方式
- `expiryDate`: Date - 有效期（可空）
- `createdAt`: Date - 创建时间
- `reviewedAt`: Date - 审核时间（可空）
- `reviewedBy`: string - 审核人ID（可空）
- `rejectionReason`: string - 拒绝原因（可空）

### 操作
- `createAuthRecord(type, credentials, verificationMethod)` - 创建认证记录
- `verifyEmail(code)` - 验证邮箱
- `verifyPhone(code)` - 验证手机
- `verifyIdentity(idCard, faceImage)` - 实名认证
- `submitProfessionalCertification(credentials)` - 提交专业认证
- `reviewAuthentication(status, reason)` - 审核认证
- `getAuthStatus()` - 获取认证状态
- `isAuthValid()` - 检查认证是否有效
- `renewAuthentication(type)` - 续期认证

---

## 8. 内容审核日志类 (AuditLog)

### 属性
- `auditId`: string - 审核记录ID
- `contentId`: string - 内容ID（帖子/评论）
- `contentType`: enum - 内容类型（Post/Comment/Message）
- `authorId`: string - 内容作者ID
- `status`: enum - 审核状态（待审核/已通过/已驳回）
- `violationType`: string - 违规类型（敏感词/重复/非法等）
- `riskScore`: number - 风险分数（0-100）
- `auditMethod`: enum - 审核方式（自动/人工）
- `reviewReason`: string - 驳回原因（可空）
- `reviewedBy`: string - 审核人ID（可空）
- `appealStatus`: enum - 申诉状态（无/待处理/已通过/已拒绝）
- `createdAt`: Date - 创建时间
- `reviewedAt`: Date - 审核时间（可空）
- `appealedAt`: Date - 申诉时间（可空）

### 操作
- `createAuditRecord(contentId, contentType, violationType)` - 创建审核记录
- `autoAudit()` - 自动审核（敏感词过滤等）
- `approveContent()` - 通过审核
- `rejectContent(reason, violationType)` - 驳回内容
- `getAuditQueue(page, priority)` - 获取待审核队列
- `assignAuditor(auditorId)` - 分配审核人
- `submitAppeal(reason)` - 提交申诉
- `handleAppeal(status, reason)` - 处理申诉
- `getAuditHistory(contentId)` - 获取审核历史

---

## 9. 标签类 (Tag)

### 属性
- `tagId`: string - 标签唯一ID
- `name`: string - 标签名称
- `category`: enum - 标签分类（股票/基金/策略等）
- `usageCount`: number - 使用次数
- `relatedTags`: string[] - 相关标签ID列表
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### 操作
- `create(name, category, relatedTags)` - 创建标签
- `edit(data)` - 编辑标签
- `delete()` - 删除标签
- `getRelatedPosts(page, sort)` - 获取使用该标签的帖子
- `incrementUsage()` - 增加使用次数
- `decrementUsage()` - 减少使用次数
- `getRelatedTags()` - 获取相关标签
- `getTrending(period)` - 获取热门标签

---

## 10. 投票类 (Poll)

### 属性
- `pollId`: string - 投票唯一ID
- `postId`: string - 所属帖子ID
- `question`: string - 投票问题
- `options`: object[] - 投票选项及投票数
  - `optionId`: string
  - `text`: string
  - `voteCount`: number
- `totalVotes`: number - 总投票数
- `voters`: object[] - 投票者信息
  - `userId`: string
  - `votedAt`: Date
  - `optionId`: string
- `startTime`: Date - 开始时间
- `endTime`: Date - 结束时间
- `status`: enum - 状态（进行中/已结束）
- `allowMultiple`: boolean - 是否允许多选
- `allowChangeVote`: boolean - 是否允许改票

### 操作
- `create(question, options, duration, settings)` - 创建投票
- `vote(userId, optionId)` - 投票
- `changeVote(userId, oldOption, newOption)` - 改票
- `cancelVote(userId)` - 取消投票
- `getResults()` - 获取投票结果
- `getResultsWithPercentage()` - 获取带百分比的结果
- `endPoll()` - 手动结束投票
- `autoEnd()` - 自动结束投票（时间到期）
- `hasVoted(userId)` - 检查用户是否已投票
- `getVoters(optionId, page)` - 获取投票该选项的用户列表

---

## 11. 热榜类 (Ranking)

### 属性
- `rankId`: string - 热榜记录ID
- `title`: string - 热榜标题
- `rankType`: enum - 排行类型（话题/股票/用户）
- `periodType`: enum - 周期类型（日/周）
- `rankings`: object[] - 排名数据
  - `rank`: number
  - `contentId`: string
  - `title`: string
  - `score`: number
  - `change`: number（变化趋势）
  - `trendIcon`: string
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### 操作
- `getRankings(rankType, period, page)` - 获取热榜
- `getHotStocks(period)` - 获取热门股票讨论
- `getHotTopics(period)` - 获取热门话题
- `getHotUsers(period)` - 获取热门用户
- `generateRankings()` - 生成热榜
- `getRankingHistory(contentId, period)` - 获取内容的排名历史
- `getTrendingNow()` - 获取实时热榜

---

## 12. 搜索类 (Search)

### 属性
- `searchId`: string - 搜索记录ID
- `userId`: string - 搜索用户ID
- `keyword`: string - 搜索关键词
- `searchType`: enum - 搜索类型（内容/用户/股票/标签）
- `filters`: object - 过滤条件
  - `boardId`: string - 板块
  - `startDate`: Date - 开始日期
  - `endDate`: Date - 结束日期
  - `minLikes`: number - 最少点赞数
  - `isEssence`: boolean - 仅精华
  - `authorId`: string - 作者ID
- `results`: object[] - 搜索结果
- `resultCount`: number - 结果总数
- `createdAt`: Date - 搜索时间
- `executionTime`: number - 执行耗时（毫秒）

### 操作
- `search(keyword, type, filters)` - 执行搜索
- `getSearchSuggestions(keyword, type)` - 获取搜索联想
- `filterByTime(startDate, endDate)` - 按时间过滤
- `filterByHotness(minLikes)` - 按热度过滤
- `filterByBoard(boardId)` - 按板块过滤
- `filterByEssence()` - 筛选精华内容
- `saveSearchHistory()` - 保存搜索历史
- `getSearchHistory(page)` - 获取搜索历史
- `clearSearchHistory()` - 清空搜索历史
- `deleteHistoryItem(searchId)` - 删除指定历史项

---

## 13. Feed流类 (Feed)

### 属性
- `feedId`: string - Feed记录ID
- `userId`: string - 用户ID
- `content`: object[] - 内容列表
  - `postId`: string
  - `type`: enum - 内容类型（文章/评论/投票）
  - `score`: number - 相关性评分
- `feedType`: enum - Feed类型（关注/推荐/热门）
- `totalCount`: number - 内容总数
- `hasMore`: boolean - 是否还有更多
- `createdAt`: Date - 生成时间
- `updatedAt`: Date - 最后更新时间

### 操作
- `generatePersonalFeed(userId, page)` - 生成个性化Feed
- `getFollowingFeed(userId, page)` - 获取关注用户内容
- `getRecommendedFeed(userId, page)` - 获取推荐内容
- `getTrendingFeed(page)` - 获取热门内容
- `refreshFeed()` - 刷新Feed
- `updateFeedScore(postId, interaction)` - 更新内容评分（基于交互）
- `markPostAsViewed(postId)` - 标记帖子为已查看

---

## 14. 违规处理类 (Violation)

### 属性
- `violationId`: string - 违规记录ID
- `userId`: string - 违规用户ID
- `contentId`: string - 涉及的内容ID（可空）
- `type`: enum - 违规类型（警告/禁言/封号/扣分）
- `severity`: enum - 严重程度（轻/中/重）
- `reason`: string - 违规原因
- `description`: string - 详细描述
- `evidence`: string[] - 证据链接
- `duration`: number - 处罚时长（天，-1表示永久）
- `status`: enum - 状态（待处理/已处理/已申诉/已撤销）
- `createdAt`: Date - 创建时间
- `expiredAt`: Date - 过期时间（可空）
- `handledBy`: string - 处理人ID
- `handledAt`: Date - 处理时间

### 操作
- `recordViolation(userId, type, reason, contentId)` - 记录违规
- `issueWarning(duration)` - 发出警告
- `muteUser(duration)` - 禁言用户
- `banUser(duration)` - 封号用户
- `deductPoints(points)` - 扣除积分
- `unmuteUser()` - 解除禁言
- `unbanUser()` - 解除封号
- `revokeViolation(reason)` - 撤销违规处罚
- `getViolationHistory(userId, page)` - 获取违规历史
- `isCurrentlyMuted()` - 检查用户是否被禁言
- `isCurrentlyBanned()` - 检查用户是否被封号
- `appealViolation(appeal)` - 申诉违规

---

## 15. 股票与基金信息类 (StockInfo/FundInfo)

### 属性
- `infoId`: string - 信息唯一ID
- `symbol`: string - 股票代码/基金代码
- `name`: string - 名称
- `type`: enum - 类型（股票/基金）
- `market`: enum - 市场（A股/港股/美股等）
- `currentPrice`: number - 当前价格
- `change`: number - 涨跌幅
- `discussionCount`: number - 讨论数
- `viewCount`: number - 浏览数
- `lastUpdated`: Date - 最后更新时间
- `description`: string - 描述

### 操作
- `getBasicInfo()` - 获取基本信息
- `getDiscussions(page, sort)` - 获取相关讨论
- `getPopularity()` - 获取热度排名
- `getTrendingAnalysis()` - 获取趋势分析
- `addToWatchlist(userId)` - 添加到自选
- `removeFromWatchlist(userId)` - 移除自选

---

## 16. 投资者适当性评估类 (RiskAssessment)

### 属性
- `assessmentId`: string - 评估记录ID
- `userId`: string - 用户ID
- `investmentExperience`: string - 投资经验年数
- `riskTolerance`: enum - 风险承受度（保守/稳健/积极/激进）
- `knowledgeLevel`: enum - 知识水平（初级/中级/高级/专业）
- `investmentAmount`: number - 投资金额
- `goals`: string[] - 投资目标
- `score`: number - 综合评分（0-100）
- `assessment`: string - 评估结果
- `recommendedStrategies`: string[] - 推荐策略
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### 操作
- `submitAssessment(answers)` - 提交评估问卷
- `calculateScore(answers)` - 计算评分
- `determineRiskTolerance()` - 确定风险等级
- `getRecommendations()` - 获取推荐策略
- `getAssessmentReport()` - 获取评估报告
- `updateAssessment(answers)` - 更新评估

---

## 17. 实时讨论类 (RealtimeDiscussion)

### 属性
- `discussionId`: string - 讨论唯一ID
- `userId`: string - 发布者ID
- `content`: string - 内容（简短文本）
- `stockSymbol`: string - 相关股票代码（可空）
- `likeCount`: number - 点赞数
- `replyCount`: number - 回复数
- `createdAt`: Date - 创建时间
- `isDeleted`: boolean - 是否已删除
- `sentiment`: enum - 情绪（看涨/看跌/中性）

### 操作
- `create(content, stockSymbol)` - 发布实时讨论
- `delete()` - 删除讨论
- `like(userId)` - 点赞
- `unlike(userId)` - 取消点赞
- `reply(userId, content)` - 回复讨论
- `getReplies(page)` - 获取回复列表
- `analyzeSentiment()` - 分析情绪
- `getMarketSentiment(symbol)` - 获取市场情绪

---

## 18. 通知类 (Notification)

### 属性
- `notificationId`: string - 通知唯一ID
- `userId`: string - 接收用户ID
- `type`: enum - 通知类型（@提及/评论/点赞/关注/消息）
- `source`: string - 来源ID（用户/帖子/评论等）
- `title`: string - 通知标题
- `message`: string - 通知内容
- `data`: object - 额外数据
- `isRead`: boolean - 是否已读
- `readAt`: Date - 已读时间（可空）
- `createdAt`: Date - 创建时间
- `expiresAt`: Date - 过期时间

### 操作
- `create(userId, type, source, content)` - 创建通知
- `markAsRead()` - 标记为已读
- `markAllAsRead()` - 标记全部为已读
- `delete()` - 删除通知
- `deleteAll()` - 删除全部通知
- `getUnreadCount()` - 获取未读通知数
- `getNotifications(page, filters)` - 获取通知列表
- `getSystemNotifications(page)` - 获取系统通知

---

## 19. 互动管理类 (Engagement)

### 属性
- `engagementId`: string - 互动记录ID
- `userId`: string - 用户ID
- `contentId`: string - 内容ID（帖子/评论）
- `contentType`: enum - 内容类型（Post/Comment）
- `engagementType`: enum - 互动类型（Like/Collect/Share）
- `createdAt`: Date - 互动时间

### 操作
- `addLike(userId, contentId, contentType)` - 添加点赞
- `removeLike(userId, contentId, contentType)` - 移除点赞
- `addCollect(userId, contentId, contentType)` - 添加收藏
- `removeCollect(userId, contentId, contentType)` - 移除收藏
- `addShare(userId, contentId, contentType)` - 添加分享
- `getUserEngagements(userId, page)` - 获取用户互动记录
- `getEngagementStats(contentId)` - 获取内容互动统计
- `batchGetEngagements(contentIds)` - 批量获取互动状态
