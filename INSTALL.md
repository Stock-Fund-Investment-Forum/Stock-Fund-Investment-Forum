# 股基论坛平台 - 安装部署文档

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [方案一：本地开发环境（推荐）](#方案一本地开发环境推荐)
- [方案二：Docker 容器化部署](#方案二docker-容器化部署)
- [方案三：生产环境部署](#方案三生产环境部署)
- [环境变量配置](#环境变量配置)
- [数据库迁移](#数据库迁移)
- [运行测试](#运行测试)
- [常见问题与故障排查](#常见问题与故障排查)

---

## 项目简介

**股基论坛平台**（Stock Fund Investment Forum）是一个专业的股票基金投资交流社区，提供帖子发布、实时讨论、投票调研、群组协作、私信通讯等功能。平台支持专业认证、风险评估、内容审核等高级特性，为投资者打造安全、专业的交流环境。

### 核心功能

- ✅ 多种帖子类型（普通帖、长文分析、投票调研、实时讨论）
- ✅ 完整的用户互动系统（点赞、收藏、分享、评论、@提及）
- ✅ 社交功能（关注/粉丝、私信聊天、群组管理）
- ✅ 专业认证与风险评估体系
- ✅ 内容审核与违规检测
- ✅ 搜索与筛选（支持帖子、用户、股票）
- ✅ 管理后台（用户管理、认证审核、审计日志）

---

## 技术栈

### 后端
- **框架**: FastAPI 0.115+
- **语言**: Python 3.11+
- **数据库**: MySQL 8.0 / SQLite（开发回退）
- **ORM**: SQLAlchemy 2.0.36+
- **认证**: JWT (python-jose)
- **异步任务**: Background Tasks
- **测试**: pytest + httpx

### 前端
- **框架**: React 19.2+
- **构建工具**: Vite 8.0+
- **路由**: React Router DOM 7.15+
- **样式**: Tailwind CSS 4.2+
- **图标**: Lucide React
- **HTTP 客户端**: Fetch API

### 部署
- **容器化**: Docker & Docker Compose
- **Web 服务器**: Uvicorn (ASGI)
- **反向代理**: Nginx（生产环境）

---

## 系统要求

### 最低配置
- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **CPU**: 2 核心
- **内存**: 4 GB RAM
- **磁盘空间**: 2 GB 可用空间

### 推荐配置
- **CPU**: 4 核心或更高
- **内存**: 8 GB RAM 或更高
- **磁盘空间**: 10 GB SSD

### 必需软件

#### 基础依赖
- **Git**: 2.30+ ([下载](https://git-scm.com/downloads))
- **Python**: 3.11 - 3.13 ([下载](https://www.python.org/downloads/))
- **Node.js**: 18.x 或更高 ([下载](https://nodejs.org/))
- **npm**: 9.x 或更高（随 Node.js 自动安装）

#### 可选依赖（Docker 部署需要）
- **Docker**: 20.10+ ([下载](https://www.docker.com/products/docker-desktop))
- **Docker Compose**: 2.0+ （Docker Desktop 已内置）

---

## 快速开始

### 5 分钟快速体验

```bash
# 1. 克隆项目
git clone <repository-url>
cd stock-forum-platform

# 2. 启动后端（Docker）
cd backend
docker compose up -d --build

# 3. 启动前端（本地）
cd ../frontend
npm install
npm run dev

# 4. 访问应用
# 浏览器打开: http://localhost:6789
```

---

## 方案一：本地开发环境（推荐）

此方案适合日常开发，后端运行在 Docker 容器中，前端使用 Vite 热重载开发服务器。

### 步骤 1：准备后端环境

#### 1.1 配置环境变量

```bash
cd backend
copy .env.example .env
```

编辑 `.env` 文件：

```ini
DATABASE_URL=mysql+pymysql://root:example@db:3306/stock_fund_forum
MYSQL_IMAGE=docker.m.daocloud.io/library/mysql:8.0
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_HOST=0.0.0.0
APP_PORT=8080
AUTO_CREATE_TABLES=true
SQLITE_FALLBACK=true
MARKET_UPDATE_INTERVAL=60
```

> ⚠️ **重要**: `SECRET_KEY` 在生产环境必须更换为强随机值！

#### 1.2 启动后端服务

```bash
cd backend
docker compose up -d --build
```

这将启动：
- MySQL 数据库容器（端口 3306）
- FastAPI 后端服务（端口 8080）

#### 1.3 验证后端运行

```bash
# 检查容器状态
docker compose ps

# 查看后端日志
docker compose logs web --tail=50

# 测试 API 健康检查
curl http://localhost:8080/health
```

预期响应：
```json
{"status": "ok"}
```

访问 API 文档：
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### 步骤 2：准备前端环境

#### 2.1 配置环境变量

```bash
cd frontend
copy .env.local.example .env.local
```

编辑 `.env.local` 文件：

```ini
VITE_API_URL=http://localhost:8080
VITE_API_BASE_PATH=/api/v1
VITE_REQUEST_TIMEOUT=10000
VITE_APP_NAME=股基论坛
VITE_ENABLE_DEBUG=true
```

#### 2.2 安装依赖并启动

```bash
cd frontend
npm install
npm run dev
```

Vite 将自动打开浏览器访问 http://localhost:6789

### 步骤 3：验证完整系统

1. 打开浏览器访问 http://localhost:6789
2. 点击右上角"注册"创建新账号
3. 登录后尝试发帖、评论等功能
4. 访问 http://localhost:8080/docs 查看 API 文档

### 开发工作流

```bash
# 后端代码修改后自动重载（uvicorn --reload 已启用）
docker compose logs -f web

# 前端代码修改后自动热重载
# Vite 会自动处理，无需额外操作

# 停止服务
docker compose down

# 重启服务
docker compose up -d
```

---

## 方案二：Docker 容器化部署

此方案适合演示、测试或小型生产环境，前后端均运行在容器中。

### 前置条件

确保已安装 Docker 和 Docker Compose。

### 步骤 1：配置环境变量

```bash
cd backend
copy .env.example .env
```

编辑 `.env` 文件，设置生产环境参数：

```ini
DATABASE_URL=mysql+pymysql://root:example@db:3306/stock_fund_forum
SECRET_KEY=generate-a-strong-random-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_HOST=0.0.0.0
APP_PORT=8080
AUTO_CREATE_TABLES=false
SQLITE_FALLBACK=false
```

### 步骤 2：构建并启动所有服务

```bash
cd backend
docker compose up -d --build
```

这将启动：
- MySQL 数据库
- FastAPI 后端服务
- （如果配置了前端服务）Nginx 静态文件服务

### 步骤 3：验证部署

```bash
# 检查所有容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 测试后端
curl http://localhost:8080/health

# 访问前端（如果配置了 nginx 服务）
# 浏览器打开: http://localhost
```

### 常用 Docker 命令

```bash
# 停止所有服务
docker compose down

# 停止并删除数据卷（谨慎使用！）
docker compose down -v

# 重启特定服务
docker compose restart web

# 进入容器内部
docker compose exec web bash

# 查看资源使用情况
docker stats
```

---

## 方案三：生产环境部署

### 架构建议

```
                    ┌─────────────┐
    Users ────────► │   Nginx     │
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼───┐  ┌────▼────┐  ┌───▼──────┐
      │  Frontend │  │ Backend │  │  MySQL   │
      │  (Static) │  │FastAPI  │  │ Database │
      └───────────┘  └─────────┘  └──────────┘
```

### 步骤 1：服务器准备

#### 1.1 安装必需软件

```bash
# Ubuntu/Debian 示例
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
```

#### 1.2 配置防火墙

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 步骤 2：部署后端

#### 2.1 上传代码到服务器

```bash
# 方式 1: Git 克隆
git clone <repository-url> /opt/stock-forum-platform
cd /opt/stock-forum-platform/backend

# 方式 2: SCP 传输
scp -r backend user@server:/opt/stock-forum-platform/
```

#### 2.2 配置生产环境变量

```bash
cd /opt/stock-forum-platform/backend
cp .env.example .env
```

编辑 `.env`：

```ini
DATABASE_URL=mysql+pymysql://root:STRONG_PASSWORD@db:3306/stock_fund_forum
SECRET_KEY=$(openssl rand -hex 32)  # 生成强随机密钥
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_HOST=0.0.0.0
APP_PORT=8080
AUTO_CREATE_TABLES=false
SQLITE_FALLBACK=false
MARKET_UPDATE_INTERVAL=300
```

#### 2.3 启动后端服务

```bash
docker compose up -d --build

# 初始化数据库
docker compose exec web alembic upgrade head
```

### 步骤 3：部署前端

#### 3.1 构建前端

```bash
cd /opt/stock-forum-platform/frontend

# 配置生产环境变量
cat > .env.production << EOF
VITE_API_URL=/api
VITE_API_BASE_PATH=/api/v1
VITE_REQUEST_TIMEOUT=10000
EOF

# 安装依赖并构建
npm install
npm run build
```

构建产物位于 `frontend/dist/` 目录。

#### 3.2 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/stock-forum`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /opt/stock-forum-platform/frontend/dist;
    index index.html;

    # 前端路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到后端容器
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/stock-forum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 步骤 4：配置 HTTPS（推荐）

```bash
# 使用 Let's Encrypt 免费证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 0 1 * * certbot renew --quiet
```

### 步骤 5：监控与维护

#### 5.1 日志查看

```bash
# 后端日志
docker compose logs -f web

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 5.2 备份数据库

```bash
# 手动备份
docker compose exec db mysqldump -u root -pexample stock_fund_forum > backup_$(date +%Y%m%d).sql

# 定时备份（crontab）
0 2 * * * docker compose exec db mysqldump -u root -pexample stock_fund_forum > /backups/backup_$(date +\%Y\%m\%d).sql
```

#### 5.3 更新部署

```bash
cd /opt/stock-forum-platform

# 拉取最新代码
git pull

# 重新构建并启动
cd backend
docker compose up -d --build

# 前端重新构建
cd ../frontend
npm install
npm run build

# 重启 Nginx
sudo systemctl reload nginx
```

---

## 环境变量配置

### 后端环境变量 (`backend/.env`)

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `DATABASE_URL` | 数据库连接字符串 | - | ✅ |
| `SECRET_KEY` | JWT 签名密钥 | - | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 访问令牌过期时间（分钟） | 60 | ❌ |
| `APP_HOST` | 监听地址 | 0.0.0.0 | ❌ |
| `APP_PORT` | 监听端口 | 8080 | ❌ |
| `AUTO_CREATE_TABLES` | 启动时自动创建表 | false | ❌ |
| `SQLITE_FALLBACK` | MySQL 失败时回退 SQLite | true | ❌ |
| `MARKET_UPDATE_INTERVAL` | 行情更新间隔（秒） | 60 | ❌ |

#### DATABASE_URL 格式示例

```ini
# MySQL
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/stock_fund_forum

# SQLite（仅开发）
DATABASE_URL=sqlite:///./stock_fund_forum.db
```

### 前端环境变量 (`frontend/.env.local`)

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `VITE_API_URL` | 后端 API 地址 | http://localhost:8080 | ✅ |
| `VITE_API_BASE_PATH` | API 基础路径 | /api/v1 | ❌ |
| `VITE_REQUEST_TIMEOUT` | 请求超时（毫秒） | 10000 | ❌ |
| `VITE_APP_NAME` | 应用名称 | 股基论坛 | ❌ |
| `VITE_ENABLE_DEBUG` | 启用调试模式 | false | ❌ |
| `VITE_ENABLE_ANALYTICS` | 启用分析追踪 | true | ❌ |

---

## 数据库迁移

项目使用 Alembic 管理数据库迁移。

### 初始化迁移

```bash
cd backend
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/macOS

alembic init alembic
```

### 创建新迁移

```bash
# 自动生成迁移脚本
alembic revision --autogenerate -m "描述你的更改"

# 手动创建迁移脚本
alembic revision -m "添加用户头像字段"
```

### 执行迁移

```bash
# 升级到最新版本
alembic upgrade head

# 升级到特定版本
alembic upgrade <revision_id>

# 回退一个版本
alembic downgrade -1

# 查看当前版本
alembic current
```

### 在 Docker 中执行迁移

```bash
docker compose exec web alembic upgrade head
```

---

## 运行测试

### 后端测试

```bash
cd backend

# 激活虚拟环境
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/macOS

# 运行所有测试
pytest -v

# 运行特定测试文件
pytest tests/test_auth.py -v

# 运行带覆盖率报告
pytest --cov=app --cov-report=html

# 查看详细输出
pytest -vv -s
```

### 前端测试

```bash
cd frontend

# 代码检查
npm run lint

# 构建测试
npm run build
```

---

## 常见问题与故障排查

### 1. 后端无法启动

**问题**: `docker compose up` 后容器不断重启

**解决**:
```bash
# 查看错误日志
docker compose logs web --tail=100

# 常见原因及解决:
# 1. 数据库连接失败 - 检查 DATABASE_URL 是否正确
# 2. 端口被占用 - 修改 APP_PORT 或 docker-compose.yml 中的端口映射
# 3. 缺少环境变量 - 确认 .env 文件存在且配置正确
```

### 2. 前端无法连接后端

**问题**: 浏览器控制台显示 CORS 错误或网络错误

**解决**:
```bash
# 1. 确认后端正在运行
curl http://localhost:8080/health

# 2. 检查前端 .env.local 配置
cat frontend/.env.local
# 确保 VITE_API_URL 指向正确的后端地址

# 3. 如果使用 Vite proxy，检查 vite.config.js 中的 proxy 配置

# 4. 清除浏览器缓存并硬刷新 (Ctrl+Shift+R)
```

### 3. 数据库连接失败

**问题**: 后端报错无法连接数据库

**解决**:
```bash
# 1. 检查 MySQL 容器是否运行
docker compose ps db

# 2. 查看数据库日志
docker compose logs db

# 3. 测试数据库连接
docker compose exec db mysql -u root -pexample -e "SHOW DATABASES;"

# 4. 如果使用本地 MySQL，检查服务是否启动
# Windows: services.msc 中查找 MySQL
# Linux: sudo systemctl status mysql
```

### 4. 端口冲突

**问题**: 端口 8080 或 3306 已被占用

**解决**:
```bash
# Windows 查看端口占用
netstat -ano | findstr 8080
taskkill /PID <进程ID> /F

# Linux 查看端口占用
lsof -i :8080
sudo kill <进程ID>

# 或者修改端口映射
# 编辑 backend/docker-compose.yml
# ports:
#   - '8081:8080'  # 改为其他端口

# 同时更新 frontend/.env.local
# VITE_API_URL=http://localhost:8081
```

### 5. Python 依赖冲突

**问题**: `pip install` 失败或版本冲突

**解决**:
```bash
cd backend

# 删除旧虚拟环境
rmdir /s /q .venv  # Windows
# rm -rf .venv  # Linux/macOS

# 重新创建
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/macOS

# 升级 pip
python -m pip install --upgrade pip

# 重新安装依赖
pip install -r requirements.txt
```

### 6. Node.js 依赖问题

**问题**: `npm install` 失败

**解决**:
```bash
cd frontend

# 清理缓存
npm cache clean --force

# 删除 node_modules 和锁文件
rmdir /s /q node_modules  # Windows
del package-lock.json

# 重新安装
npm install

# 如果使用 yarn
yarn install
```

### 7. 数据库迁移失败

**问题**: `alembic upgrade head` 报错

**解决**:
```bash
# 1. 查看当前迁移状态
alembic current

# 2. 查看迁移历史
alembic history --verbose

# 3. 如果有冲突，手动修复迁移脚本
# 编辑 alembic/versions/<file>.py

# 4. 重新执行
alembic upgrade head

# 5. 如需重置（开发环境）
alembic downgrade base
alembic upgrade head
```

### 8. Docker 构建缓慢

**问题**: `docker compose build` 耗时过长

**解决**:
```bash
# 1. 使用国内镜像源
# 编辑 Dockerfile，替换为国内镜像
# FROM docker.m.daocloud.io/library/python:3.11-slim

# 2. 利用 Docker 缓存
# 不要频繁修改 requirements.txt

# 3. 多阶段构建（生产环境）
# 优化 Dockerfile 减少层数

# 4. 清理无用镜像
docker system prune -a
```

### 9. 前端白屏或路由错误

**问题**: 访问页面显示白屏或 404

**解决**:
```bash
# 1. 检查浏览器控制台错误
# F12 打开开发者工具查看 Console 和 Network

# 2. 确认前端构建成功
npm run build
# 检查 dist/ 目录是否生成

# 3. Nginx 配置检查（生产环境）
sudo nginx -t
sudo systemctl reload nginx

# 4. 确认 Vite 路由配置
# 检查 src/App.jsx 中的路由定义
```

### 10. 性能问题

**问题**: 应用响应缓慢

**解决**:
```bash
# 后端优化
# 1. 启用数据库连接池
# 2. 添加 Redis 缓存（可选）
# 3. 优化慢查询
docker compose logs web | grep "slow query"

# 前端优化
# 1. 启用代码分割（已配置）
# 2. 压缩静态资源
npm run build  # 生产构建自动压缩

# 3. 启用 CDN（生产环境）
# 4. 图片懒加载和压缩
```

---

## 获取帮助

### 文档资源

- API 文档: http://localhost:8080/docs
- 项目 README: `backend/README.md`, `frontend/README.md`
- 本地设置指南: `LOCAL_SETUP.md`
- 前端文档: `frontend/docs/`

### 技术支持

如有问题，请：
1. 查阅本文档的"常见问题"章节
2. 查看相关日志输出
3. 在项目 Issues 中搜索类似问题
4. 提交新的 Issue 并提供：
   - 错误信息全文
   - 复现步骤
   - 环境信息（操作系统、软件版本）
   - 相关日志片段

---

## 附录

### A. 快速命令参考

```bash
# 启动开发环境
cd backend && docker compose up -d
cd ../frontend && npm run dev

# 停止所有服务
cd backend && docker compose down

# 查看日志
docker compose logs -f web
docker compose logs -f db

# 重启服务
docker compose restart

# 进入容器
docker compose exec web bash
docker compose exec db mysql -u root -pexample

# 运行测试
cd backend && pytest -v
cd frontend && npm run lint

# 数据库备份
docker compose exec db mysqldump -u root -pexample stock_fund_forum > backup.sql

# 数据库恢复
docker compose exec -T db mysql -u root -pexample stock_fund_forum < backup.sql
```

### B. 目录结构

```
stock-forum-platform/
├── backend/                 # 后端代码
│   ├── app/                # 应用核心代码
│   │   ├── routers/        # API 路由
│   │   ├── models.py       # 数据模型
│   │   ├── schemas.py      # Pydantic 模式
│   │   ├── crud.py         # 数据库操作
│   │   ├── auth.py         # 认证逻辑
│   │   ├── database.py     # 数据库配置
│   │   └── main.py         # 应用入口
│   ├── tests/              # 测试代码
│   ├── alembic/            # 数据库迁移
│   ├── requirements.txt    # Python 依赖
│   ├── docker-compose.yml  # Docker 配置
│   └── Dockerfile          # 后端镜像
│
├── frontend/               # 前端代码
│   ├── src/                # 源代码
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── context/        # React Context
│   │   ├── utils/          # 工具函数
│   │   └── App.jsx         # 应用根组件
│   ├── public/             # 静态资源
│   ├── package.json        # Node.js 依赖
│   ├── vite.config.js      # Vite 配置
│   └── dist/               # 构建产物（生成）
│
├── LOCAL_SETUP.md          # 本地设置指南
├── INSTALL.md              # 安装文档（本文件）
└── USER_GUIDE.md           # 用户使用手册
```

### C. 版本兼容性

| 组件 | 最低版本 | 推荐版本 | 测试版本 |
|------|---------|---------|---------|
| Python | 3.11 | 3.11 - 3.13 | 3.13.5 |
| Node.js | 18.x | 20.x LTS | 20.x |
| MySQL | 8.0 | 8.0 | 8.0 |
| Docker | 20.10 | 24.x | 24.x |
| FastAPI | 0.115 | 0.115.x | 0.115.x |
| React | 19.0 | 19.2.x | 19.2.5 |
| SQLAlchemy | 2.0.36 | 2.0.36+ | 2.0.36 |

---

**最后更新**: 2026-06-24  
**文档版本**: 1.0.0  
**维护者**: 股基论坛开发团队
