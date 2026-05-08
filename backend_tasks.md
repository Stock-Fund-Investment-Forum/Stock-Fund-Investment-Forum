# 后端实现任务清单（自动生成）

## 概览

- 来源文件： [api/openapi.yaml](api/openapi.yaml)、[database_schema.sql](database_schema.sql)、[README.md](README.md)
- 目的：根据现有接口规范与数据库模式，列出后端需要实现的任务、优先级与验收标准，便于分工和跟踪。

---

## 优先级任务（按执行顺序）

1. **认证与授权（Auth）**
   - 描述：实现注册、登录、JWT 鉴权、权限校验、Token 刷新与注销。
   - 依据：见 [api/openapi.yaml](api/openapi.yaml) 中 `auth` 标签与 `bearerAuth` securitySchemes。
   - 验收标准：`/auth/register`、`/auth/login` 正常返回；受保护接口需验证 JWT；错误码规范。
   - 预估：2-3 天

2. **用户模块（Users）**
   - 描述：用户 CRUD、分页查询、资料更新、账号状态管理、关注关系。
   - 依据：数据库表 `users`, `authentication`, `user_follows`（见 [database_schema.sql](database_schema.sql)）。
   - 关键接口：`/users` 列表与创建，用户详情/更新/删除端点。
   - 验收标准：用户创建/查询/更新/软删除通过单元测试，分页与过滤符合 API 规范。
   - 预估：3-4 天

3. **社区内容（帖子、评论、板块、标签）**
   - 描述：帖子发布、编辑、删除、评论、标签关联、板块管理、帖子统计（浏览/点赞/评论计数）。
   - 依据：`posts`, `comments`, `boards`, `tags`, `post_tags` 表和 [api/openapi.yaml](api/openapi.yaml) 的 `posts`/`comments`/`boards`。
   - 验收标准：发帖/评论流程完整；计数原子更新；常见查询（按板块、标签、热度）返回正确结果。
   - 预估：4-6 天

4. **附件、投票、互动（Attachments / Polls / Engagements）**
   - 描述：附件上传/存储/访问、投票创建与投票记录、点赞/收藏等互动记录。
   - 依据：`attachments`, `polls`, `poll_options`, `poll_votes`, `engagements` 表；OpenAPI 中相应组件。
   - 验收标准：支持多文件上传（或代理存储）；投票逻辑防重投；互动去重与计数正确。
   - 预估：2-4 天

5. **实时与股票/基金信息（Stocks / Realtime）**
   - 描述：股票/基金信息表接口、实时讨论（realtime_discussions）、周期性行情更新任务（后台 Job）。
   - 依据：`stock_infos`, `realtime_discussions` 表；OpenAPI 中 `stocks` 标签。
   - 验收标准：能通过定时任务更新 `stock_infos`，实时讨论可创建并正确关联行情数据；提供按股票聚合查询API。
   - 预估：3-5 天

6. **私信与通知（Messages / Notifications）**
   - 描述：私信发送/读取、通知生成与标记已读、推送接口（如果需要）。
   - 依据：`messages`, `notifications` 表。
   - 验收标准：私信可靠送达与查询；通知在关键事件后产生；读取/未读计数正确。
   - 预估：2 天

7. **审核与违规管理（Audit / Violations）**
   - 描述：内容审核日志、违规记录、管理员接口（封禁、禁言、处理申诉）。
   - 依据：`audit_logs`, `violations` 表。
   - 验收标准：管理员可查看/处理违规；相关记录入库并可按条件查询。
   - 预估：2-3 天

8. **数据库迁移、种子数据和备份策略**
   - 描述：将 `database_schema.sql` 转成迁移脚本（Flyway/Migrate/ Alembic 等），编写必要的种子数据与备份脚本。
   - 依据：`database_schema.sql`。
   - 验收标准：能在新环境通过迁移重建表结构并导入基础数据。
   - 预估：1-2 天

9. **测试、CI 与容器化**
   - 描述：单元测试、接口测试（集成测试），配置 CI（GitHub Actions/GitLab CI），编写 `Dockerfile` 与 `docker-compose`（包含数据库与可选的缓存/队列）。
   - 验收标准：关键接口拥有自动化测试；CI 在 PR 中通过；提供可在本地一键启动的 compose 环境。
   - 预估：2-4 天

10. **监控、日志与错误追踪**

- 描述：结构化日志、性能指标、错误上报（Sentry/类似）与基本指标告警（CPU/DB 连接/队列积压）。
- 验收标准：能查询请求日志；关键错误上报到 Sentry（或记录到日志），并能查看基础指标面板。
- 预估：1-2 天

---

## 附加说明与分配建议

- 按模块拆分任务为小 PR（每个 PR 包含接口实现 + 单元测试 + 数据迁移或 schema 变更）。
- 优先实现认证、用户与帖子模块以支持前端早期展示页。实现自动化部署与测试以保证后续迭代速度。
- 推荐技术栈（示例）：Spring Boot / Express.js / Django（任选其一），数据库 MySQL（schema 已给出），缓存 Redis，消息队列 RabbitMQ 或 Redis Streams（用于后台任务）。

---

## 如何使用本文件

- 将每一项拆成具体 Issue，并在 Issue 描述中引用对应数据库表与 OpenAPI 路径（参考本文件顶部的来源文件）。
- 若需要我帮助按接口生成具体的 Issue 模板或示例代码，可回复“生成 Issue 模板”。

----

文件生成于项目自动分析，若需调整优先级或细化验收标准请告知。

---

## Issue 模板（将每项任务复制为仓库 Issue）

下面为每个优先级任务提供的 Issue 模板。创建 Issue 时，将方括号内容替换为具体值，并在 Issue 描述中粘贴相关 API 路径或数据库表链接。

### Auth: 实现认证与授权

- Issue 标题：Auth — 实现注册/登录与 JWT 鉴权
- 描述：
  - 目标：实现 `/auth/register` 与 `/auth/login`，生成 JWT 并保护需要鉴权的接口。
  - 实现要点：输入验证、密码安全存储（bcrypt）、token 签发与过期、token 黑名单/注销策略（可选）。
- 验收标准：
  - 注册返回 201 并在 DB 中创建 `users` 记录；登录返回 `access_token`。
  - 受保护接口在无/无效 token 下返回 401。
- 标签：backend, auth, high
- 估时：2-3 天
- 相关文件：`api/openapi.yaml`, `database_schema.sql`

### Users: 用户模块

- Issue 标题：Users — 用户 CRUD 与分页查询
- 描述：实现用户创建、读取、更新、软删除与分页查询接口；实现关注/取关接口。
- 验收标准：用户能被创建并查询；分页参数生效；敏感字段（密码）不在输出中。
- 标签：backend, users, high
- 估时：3-4 天
- 相关文件：`database_schema.sql`, `api/openapi.yaml`

### Posts: 帖子/评论/板块/标签

- Issue 标题：Posts — 帖子与评论核心功能
- 描述：实现发帖/编辑/删除、评论、帖子-标签关联、板块 CRUD、计数原子更新逻辑。
- 验收标准：发帖流程可用；评论可嵌套回复；计数（view/like/comment）并发安全。
- 标签：backend, posts, core
- 估时：4-6 天
- 相关文件：`database_schema.sql`, `api/openapi.yaml`

### Attachments / Polls / Engagements

- Issue 标题：Attachments/Polls/Engagements — 附件与互动功能
- 描述：实现附件上传与访问、投票创建与投票记录、点赞/收藏等互动记录 API。
- 验收标准：支持文件上传接口；投票防重投；互动记录可查询与去重。
- 标签：backend, attachments, medium
- 估时：2-4 天
- 相关文件：`database_schema.sql`

### Stocks & Realtime

- Issue 标题：Stocks — 股票/基金信息与实时讨论
- 描述：实现 `stock_infos` CRUD、定时行情更新任务、`realtime_discussions` 的创建与查询接口。
- 验收标准：定时任务能成功更新 `stock_infos`；实时讨论与股票关联正确。
- 标签：backend, stocks, medium
- 估时：3-5 天
- 相关文件：`database_schema.sql`, `api/openapi.yaml`

### Messages & Notifications

- Issue 标题：Messages/Notifications — 私信与通知
- 描述：实现私信发送/读取、通知生成、标记已读接口。
- 验收标准：私信可靠存储并可分页查询；关键事件生成通知并能标记已读。
- 标签：backend, messages, low
- 估时：2 天
- 相关文件：`database_schema.sql`

### Audit & Violations

- Issue 标题：Audit/Violations — 审核与违规管理
- 描述：实现审核日志、违规记录与管理员处理接口（封禁/禁言/申诉处理）。
- 验收标准：管理员能查看/更新违规记录；审核日志可按条件筛选。
- 标签：backend, admin, medium
- 估时：2-3 天
- 相关文件：`database_schema.sql`

### DB Migrations & Seeds

- Issue 标题：DB — 添加 Alembic 配置与初始迁移/种子数据
- 描述：配置 Alembic（或其他迁移工具），将 `database_schema.sql` 转为迁移脚本并添加基础种子数据（示例用户/板块）。
- 验收标准：能在新环境通过迁移命令创建表与导入种子数据。
- 标签：backend, infra, low
- 估时：1-2 天
- 相关文件：`database_schema.sql`

### CI / Tests / Containerization

- Issue 标题：CI — 单元测试、集成测试与 CI 配置（Docker）
- 描述：编写关键模块的单元/集成测试，添加 GitHub Actions（或其他 CI）并提供 `Dockerfile` 与 `docker-compose` 启动方案。
- 验收标准：PR 时自动运行测试；`docker-compose up` 能本地启动服务（数据库 + app）。
- 标签：ci, tests, infra
- 估时：2-4 天
- 相关文件：`docker-compose.yml`, `Dockerfile`, `requirements.txt`

### Monitoring & Logging

- Issue 标题：Monitoring — 日志与错误追踪
- 描述：添加结构化日志、错误追踪（例如 Sentry）、并记录基本性能指标。
- 验收标准：关键错误发送到错误追踪服务；能查看请求/错误日志。
- 标签：infra, monitoring, low
- 估时：1-2 天
