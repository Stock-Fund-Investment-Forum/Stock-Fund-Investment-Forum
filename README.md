# Stock Fund Investment Forum - 股基论坛平台

## 📋 项目简介

一个基于React + FastAPI的全栈股票基金投资论坛平台，支持用户交流、内容分享、社交互动等功能。

---

- [邓继舟](https://github.com/hezhui845) U202417338 软件2402 https://github.com/hezhui845
- [赵原一](https://github.com/sixteen06) U202417358 软件2402 https://github.com/sixteen06
- [李烨](https://github.com/lyxyz5223) U202417342 软件2402 https://github.com/lyxyz5223
- [陶宏阳](https://github.com/peeker-tao) U202417349 软件2402 https://github.com/peeker-tao
- [郭熙诚](https://github.com/season-guo) U202417341 软件2402 https://github.com/season-guo


**项目负责人**: [赵原一](https://github.com/sixteen06)

---

## 🏗️ 技术架构

### 前端架构 (Frontend)

#### 核心技术栈
- **框架**: React 19.2+
- **构建工具**: Vite 8.0+
- **路由**: React Router DOM 7.15+
- **样式**: Tailwind CSS 4.2+
- **图标**: Lucide React
- **HTTP客户端**: Fetch API (自定义封装)

#### 项目结构
```
frontend/
├── src/
│   ├── components/        # 通用组件
│   │   ├── common/        # 基础组件（Button, Input等）
│   │   └── layout/        # 布局组件（Header, Footer, Sidebar）
│   ├── pages/             # 页面组件
│   │   ├── auth/          # 认证页面（Login, Register）
│   │   ├── forum/         # 论坛页面
│   │   ├── user/          # 用户页面
│   │   └── admin/         # 管理后台
│   ├── services/          # API服务层
│   │   ├── http.js        # HTTP客户端封装
│   │   ├── authService.js # 认证服务
│   │   ├── userService.js # 用户服务
│   │   ├── postService.js # 帖子服务
│   │   └── ...            # 其他服务
│   ├── context/           # React Context
│   │   └── AuthContext.jsx # 认证上下文
│   ├── config/            # 配置文件
│   ├── constants/         # 常量定义
│   ├── utils/             # 工具函数
│   ├── App.jsx            # 根组件
│   └── main.jsx           # 入口文件
├── public/                # 静态资源
├── index.html
├── vite.config.js         # Vite配置
├── package.json           # 依赖配置
└── tailwind.config.js     # Tailwind配置
```

#### 关键特性
- ✅ 组件化设计，高复用性
- ✅ 响应式布局，支持多端适配
- ✅ 路由懒加载，优化首屏性能
- ✅ Context API管理全局状态
- ✅ 统一的HTTP客户端封装
- ✅ JWT Token自动管理
- ✅ 表单验证和错误处理

---

### 后端架构 (Backend)

#### 核心技术栈
- **框架**: FastAPI 0.115+
- **语言**: Python 3.13
- **ORM**: SQLAlchemy 2.0.36
- **认证**: JWT (python-jose)
- **密码加密**: bcrypt (passlib)
- **数据库**: MySQL 8.0 / SQLite（测试用）
- **测试**: pytest 7.4.0 + httpx
- **异步服务器**: Uvicorn

#### 项目结构
```
backend/
├── app/
│   ├── routers/           # API路由层（15个模块）
│   │   ├── auth.py        # 认证系统（2个API）
│   │   ├── users.py       # 用户系统（12个API）
│   │   ├── boards.py      # 板块管理（6个API）
│   │   ├── posts.py       # 帖子系统（9个API）
│   │   ├── comments.py    # 评论系统（8个API）
│   │   ├── polls.py       # 投票系统（3个API）
│   │   ├── attachments.py # 附件上传（1个API）
│   │   ├── engagements.py # 互动功能（3个API）
│   │   ├── messages.py    # 私信系统（5个API）
│   │   ├── notifications.py # 通知系统（4个API）
│   │   ├── stocks.py      # 股票关联（4个API）
│   │   ├── groups.py      # 群组功能（15+个API）
│   │   ├── tags.py        # 标签系统（2个API）
│   │   ├── audit.py       # 审计日志（4个API）
│   │   └── admin.py       # 管理后台（10+个API）
│   │
│   ├── models.py          # 数据模型层（SQLAlchemy ORM, ~500行）
│   ├── schemas.py         # 数据验证层（Pydantic模式, ~400行）
│   ├── crud.py            # 数据库操作层（CRUD函数, ~800行）
│   ├── auth.py            # 认证工具（JWT, ~100行）
│   ├── database.py        # 数据库配置（~50行）
│   ├── main.py            # 应用入口（~150行）
│   └── tasks/             # 后台任务
│       └── market_updater.py # 市场数据更新
│
├── tests/                 # 测试代码（13个文件）
│   ├── conftest.py        # 测试fixtures配置
│   ├── test_auth.py       # 认证测试
│   ├── test_users.py      # 用户测试
│   ├── test_posts.py      # 帖子测试
│   ├── test_comments.py   # 评论测试
│   ├── test_polls.py      # 投票测试
│   ├── test_attachments.py # 附件测试
│   ├── test_engagements.py # 互动测试
│   ├── test_messages_notifications.py # 消息通知测试
│   ├── test_stocks.py     # 股票测试
│   ├── test_audit.py      # 审计测试
│   ├── test_boards.py     # 板块测试
│   └── test_integration_auth_posts.py # 集成测试
│
├── alembic/               # 数据库迁移脚本
├── uploads/               # 文件上传目录
├── database_schema.sql    # 数据库脚本（27.5KB）
├── requirements.txt       # Python依赖
├── docker-compose.yml     # Docker配置
└── .env.example           # 环境变量模板
```

#### 核心模块说明

##### 1. 认证系统 (auth.py)
- 用户注册（邮箱/手机号）
- 用户登录（OAuth2标准）
- JWT Token生成和验证
- 密码bcrypt加密存储
- 昵称唯一性验证

##### 2. 用户系统 (users.py)
- 用户CRUD操作
- 关注/粉丝系统
- 个人资料管理
- 用户统计（粉丝数、关注数、帖子数）
- 我的收藏列表
- 用户列表查询（分页、搜索）

##### 3. 板块管理 (boards.py)
- 板块CRUD操作
- 按分类过滤
- 订阅/取消订阅
- 管理员权限控制

##### 4. 帖子系统 (posts.py)
- 帖子CRUD操作
- 多种排序方式（热度、时间、评论数、点赞数、精华）
- 多条件过滤（板块、作者、类型、标签）
- 浏览次数统计
- 软删除机制
- 自动填充作者昵称

##### 5. 评论系统 (comments.py)
- 评论CRUD操作
- 楼中楼回复（多级嵌套）
- 点赞功能
- 权限验证
- 自动填充评论者昵称

##### 6. 投票系统 (polls.py)
- 创建投票（关联帖子）
- 用户投票（防重复）
- 实时票数统计
- 百分比计算

##### 7. 附件上传 (attachments.py)
- 单文件/多文件上传
- FormData参数支持
- 文件大小限制
- 本地文件系统存储
- 唯一文件名生成

##### 8. 互动功能 (engagements.py)
- 点赞/收藏功能
- 防止重复互动
- 支持多种内容类型（POST, COMMENT）
- 支持多种互动类型（LIKE, BOOKMARK）

##### 9. 私信系统 (messages.py)
- 发送私信
- 对话列表（聚合显示）
- 对话历史（分页）
- 标记已读
- 未读消息计数
- 与通知系统联动

##### 10. 通知系统 (notifications.py)
- 获取通知列表
- 标记已读（单个/全部）
- 未读通知计数
- 多种通知类型（MESSAGE, LIKE, COMMENT, FOLLOW, MENTION, SYSTEM）

##### 11. 股票关联 (stocks.py)
- 股票记录管理
- 帖子与股票关联
- 股票讨论聚合查询

##### 12. 群组功能 (groups.py)
- 创建群组（公开/私密/审核）
- 加入/退出群组
- 群组成员管理
- 群主和管理员权限
- 群内发帖
- 入群申请审批

##### 13. 标签系统 (tags.py)
- 标签管理
- 帖子标签关联
- 按标签过滤

##### 14. 审计日志 (audit.py)
- 举报违规内容
- 审核工作流
- 违规处理
- 审计日志记录

##### 15. 管理后台 (admin.py)
- 内容审核
- 用户管理（禁用、封号）
- 认证审批
- 举报处理
- 数据统计
- 需要管理员权限

#### 架构特点
- ✅ RESTful API设计
- ✅ 分层架构（路由层、业务层、数据访问层）
- ✅ 依赖注入（Depends）
- ✅ 异步支持（AsyncSession）
- ✅ 统一的异常处理
- ✅ Pydantic数据验证
- ✅ 自动生成Swagger文档
- ✅ JWT认证和授权
- ✅ 软删除机制
- ✅ 分页和过滤
- ✅ CORS跨域支持

#### API统计
- **总API端点**: 80+个
- **路由模块**: 15个
- **代码行数**: ~3600行（路由1621行 + 支撑2000行）
- **测试用例**: 16个（100%通过率）

---

## 🗄️ 数据库设计

### 核心实体（20+个表）
- `users` - 用户表
- `user_follows` - 关注关系表
- `boards` - 板块表
- `posts` - 帖子表
- `comments` - 评论表
- `polls` - 投票表
- `poll_options` - 投票选项表
- `poll_votes` - 投票记录表
- `attachments` - 附件表
- `engagements` - 互动表（点赞/收藏）
- `messages` - 私信表
- `notifications` - 通知表
- `stocks` - 股票表
- `post_stocks` - 帖子股票关联表
- `groups` - 群组表
- `group_members` - 群组成员表
- `tags` - 标签表
- `post_tags` - 帖子标签关联表
- `violations` - 违规记录表
- `audit_logs` - 审计日志表

### 设计原则
- 使用UUID作为主键
- 软删除机制（deleted_at字段）
- 审计字段（created_at, updated_at, created_by）
- 适当的索引优化
- 外键约束保证数据完整性

---

## 🧪 测试

### 测试覆盖
- **单元测试**: 13个测试文件
- **集成测试**: 端到端流程测试
- **测试用例**: 16个
- **通过率**: 100% ✅
- **执行时间**: ~7秒

### 运行测试
```bash
cd backend
pytest -v
```

---



## 📚 文档


### 用户文档
- [`INSTALL.md`](INSTALL.md) - 安装部署指南
- [`USER_GUIDE.md`](USER_GUIDE.md) - 用户使用手册

- [`test.md`](backend/tests/test.md) - 测试报告

---

## 🎯 项目特色

1. **完整的功能实现**: 15个后端模块，80+个API端点
2. **高质量的代码**: 统一的规范，完善的注释，类型提示
3. **全面的测试**: 16个测试用例，100%通过率
4. **详细的文档**: 从需求到实现的完整文档链
5. **现代化的技术栈**: FastAPI + React + MySQL
6. **AI辅助开发**: 完整记录AI辅助开发过程
7. **团队协作**: 5人团队，明确分工，高效协作

---

## 📊 项目统计

| 类别 | 数量 | 规模 |
|------|------|------|
| 后端模块 | 15个 | ~3600行代码 |
| 前端组件 | 20+个 | ~2000行代码 |
| API端点 | 80+个 | - |
| 数据库表 | 20+个 | - |
| 测试用例 | 16个 | ~838行代码 |
| 文档文件 | 12个 | ~150KB |
| **总计** | - | **~6500行代码** |

---

## 🔗 相关链接

- **GitHub仓库**: [Stock-Fund-Investment-Forum](https://github.com/sixteen06/Stock-Fund-Investment-Forum)
- **API文档**: http://localhost:8080/docs (运行后访问)
- **前端地址**: http://localhost:6789 (运行后访问)

---

## 📝 许可证

本项目仅供学习和研究使用。

---

**最后更新**: 2026-06-24  
**版本**: v1.0.0  
**维护者**: 股基论坛开发团队

**让我们一起打造优秀的股基论坛平台！** 🚀
