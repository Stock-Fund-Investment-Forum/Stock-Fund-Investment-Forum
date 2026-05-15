# 后端接口文档（Backend API）

说明：本文件为后端 RESTful API 的概览与使用说明，基于项目的数据库设计与类设计（见 `database_schema.sql`、`architect.md`）以及 `api/openapi.yaml`（OpenAPI 3.0 模板）。

版本：v1.0.0
基础路径：/api/v1
鉴权：Bearer JWT（Authorization: Bearer <token>）

## 目录
- 概览
- 认证（auth）
- 用户（users）
- 板块（boards）与帖子（posts）
- 评论（comments）
- 标签（tags）
- 投票（polls）
- 附件（attachments）
- 私信（messages）与通知（notifications）
- 群组（groups）
- 股票/基金（stocks）
- 错误码与分页规范
- OpenAPI / Swagger

## 概览
- API 风格：RESTful，JSON 为主；文件上传使用 multipart/form-data。
- 响应编码：HTTP 状态码 + 统一错误响应结构（见下文）。
- 时间格式：ISO 8601（UTC），字段名多以 `_at` 或 `created_at` 命名。

## 鉴权（auth）
- 注册：POST /auth/register
  - 请求体：{ nickname, email, password }
  - 成功：201，返回新用户对象
- 登录：POST /auth/login
  - 请求体：{ email|phone, password }
  - 成功：200，返回 { token, token_type, expires_in }
- 所有需要鉴权的接口在请求头中包含：
  - Authorization: Bearer <JWT>

## 用户（users）
- 查询用户列表：GET /users
  - 支持分页：page, per_page；支持按 status, nickname 等过滤。
  - 成功：200，{ total, items: [User] }
- 创建用户：POST /users
  - 管理员或注册流程（同 /auth/register）。
- 获取单个用户：GET /users/{userId}
- 更新用户：PUT /users/{userId}（需鉴权、权限校验）
- 删除（软删除）：DELETE /users/{userId}（需鉴权/管理员）

User 示例（部分字段）：
{
  "user_id": "user-...",
  "nickname": "Alice",
  "email": "alice@example.com",
  "auth_level": "EMAIL_VERIFIED",
  "status": "ACTIVE",
  "points": 120,
  "created_at": "2026-05-08T10:00:00Z"
}

## 板块（boards）与帖子（posts）
- 列表：GET /boards
- 创建板块：POST /boards（需鉴权/管理员）
- 获取板块下帖子：GET /boards/{boardId}/posts

帖子操作：
- 列表/搜索：GET /posts?q=&tag=&board_id=&page=&per_page=
- 创建：POST /posts（需鉴权）
  - 请求：PostCreateRequest { board_id, title, content, tags[], post_type }
- 获取详情：GET /posts/{postId}
- 更新：PUT /posts/{postId}（作者或管理员）
- 删除（软删除）：DELETE /posts/{postId}

Post 简要示例：
{
  "post_id": "post-...",
  "user_id": "user-...",
  "board_id": "board_002",
  "title": "关于某支科技股的讨论",
  "content": "正文...",
  "post_type": "DISCUSSION",
  "view_count": 123,
  "like_count": 10
}

## 评论（comments）
- 获取帖子评论：GET /posts/{postId}/comments
- 发布评论：POST /posts/{postId}/comments（需鉴权） { parent_comment_id?, content }
- 获取单个评论：GET /comments/{commentId}
- 更新评论：PUT /comments/{commentId}（作者）
- 删除评论：DELETE /comments/{commentId}（作者或管理员）

Comment 示例：
{
  "comment_id": "cmt-...",
  "post_id": "post-...",
  "parent_comment_id": null,
  "user_id": "user-...",
  "content": "赞同楼主观点",
  "audit_status": "APPROVED",
  "created_at": "2026-05-08T11:00:00Z"
}

## 标签（tags）
- 标签列表/搜索：GET /tags?q=
- 标签对象包含：tag_id, name, category, usage_count, is_hot

## 投票（polls）
- 创建投票（挂在帖子上）：POST /polls（需鉴权，body 包含 poll 与 option）
- 投票：POST /polls/{pollId}/vote { option_id }
- 投票结果、选项查询应由 GET /polls/{pollId} 实现（可扩展）

## 附件（attachments）
- 上传：POST /attachments（multipart/form-data, 需鉴权）
  - 表单字段：post_id, file (binary)
  - 返回：201，Attachment 对象（attachment_id, file_path, file_type 等）
- 下载/访问：由文件存储 URL（file_path）提供，或通过受控接口提供权限检查。

## 私信（messages）与通知（notifications）
- 发送私信：POST /messages { recipient_id, content }（需鉴权）
- 获取会话/消息：GET /messages?page=
- 获取通知：GET /notifications?is_read=

Message 示例：
{
  "message_id": "msg-...",
  "sender_id": "user-...",
  "recipient_id": "user-...",
  "content": "消息内容",
  "is_read": false
}

## 群组（groups）
- 列表：GET /groups
- 创建群组：POST /groups（需鉴权） { name, description, access_level }
- 群组成员管理通过 /group_memberships 或 /groups/{groupId}/members 实现（建议实现：加入/退出/审核/提升角色）

## 股票/基金（stocks）
- 查询：GET /stocks?q=&symbol=
- 讨论计数、热度由后台异步/定时任务更新到 `stock_infos` 表

## 错误码与统一错误响应
- 建议统一错误格式：
{
  "code": 400,
  "message": "Bad Request",
  "detail": { ... optional ... }
}

常见状态码：
- 200 OK：成功返回数据
- 201 Created：资源已创建
- 204 No Content：执行成功但无返回体（删除等）
- 400 Bad Request：参数错误
- 401 Unauthorized：未鉴权或 token 无效
- 403 Forbidden：没有权限
- 404 Not Found：资源未找到
- 422 Unprocessable Entity：验证失败
- 500 Internal Server Error：服务器内部错误

## 分页、排序与过滤约定
- 分页参数：page（默认 1），per_page（默认 20）
- 列表响应：{ total: number, items: [ ... ] }
- 排序参数：sort_by, order (asc|desc)
- 过滤参数：按资源需要定义（如 board_id、tag、status 等）

## 安全与速率限制建议
- 使用 JWT 鉴权并在服务端校验签名与过期时间
- 对高频接口（登录、评论、发帖）实施速率限制（如 10 req/min）
- 对文件上传限制大小与类型，并对文件名路径进行严格校验

## OpenAPI / Swagger
- 完整的机器可读规范位于：`api/openapi.yaml`。可导入 Swagger UI / ReDoc 做交互式文档与测试。

## 实施与开发注意事项（工程实践）
- 资源权限必须在业务层校验（作者只能修改自己的帖子/评论，管理员可以管理全部）。
- 审核流程：帖子/评论可处于 PENDING/APPROVED/REJECTED，前端应根据 audit_status 调整展示。
- 软删除：多数表使用 is_deleted 标记，接口查询默认排除软删除记录。
- 索引与性能：关注 posts、comments、tags 的复合索引（见 `database_schema.sql`），分页查询使用覆盖索引并避免 OFFSET 大偏移。
- 日志与审计：关键操作写入 audit_logs 表，并保留足够信息以便回溯。

## 示例：创建帖子（请求/响应）
请求：
POST /api/v1/posts
Headers: Authorization: Bearer <token>
Body (application/json):
{
  "board_id": "board_002",
  "title": "聊聊某科技股的估值",
  "content": "正文...",
  "tags": ["tag_stock_001"],
  "post_type": "DISCUSSION"
}

成功响应：201
{
  "post_id": "post-...",
  "user_id": "user-...",
  "board_id": "board_002",
  "title": "聊聊某科技股的估值",
  "content": "正文...",
  "post_type": "DISCUSSION",
  "status": "PUBLISHED",
  "created_at": "2026-05-08T12:00:00Z"
}

## 开发者快速开始
1. 从 `api/openapi.yaml` 获取完整接口定义并导入到 Swagger UI。
2. 使用 Postman 或 curl 按 OpenAPI 示例调试鉴权、创建/查询流程。
3. 在后端实现时，优先保证鉴权、输入验证与错误处理一致性。

## 变更记录
- 2026-05-08: 初始版本 based on database_schema.sql, architect.md and api/openapi.yaml.

---

文件位置：`backend_api.md`（仓库根目录）
更多自动化工作：若需要，我可以基于 `api/openapi.yaml` 生成更完整的 Markdown 文档、自动化测试用例或服务器样板代码。
