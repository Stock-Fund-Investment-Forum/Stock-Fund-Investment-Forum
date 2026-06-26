# 后端本地运行与集成测试说明

本文档说明如何在本地启动后端服务并运行示例集成测试（pytest）。

## 环境要求
- Python 3.10+
- pip
- 可选：Docker 与 docker-compose（用于 MySQL）

## 环境变量示例（开发）
在 `backend-test` 目录创建 `.env` 或在运行时导出：

- `DATABASE_URL`：例如 `mysql+pymysql://root:example@127.0.0.1:3306/stock_fund_forum` 或本地 sqlite 路径（见下）
- `APP_HOST`：`0.0.0.0`
- `APP_PORT`：`8080`
- `AUTO_CREATE_TABLES`：`true`（首次运行时可开启）
- `SECRET_KEY`：JWT 使用的密钥

示例（Windows PowerShell）：

```powershell
cd backend-test
#$env:DATABASE_URL = 'mysql+pymysql://root:example@127.0.0.1:3306/stock_fund_forum'
#$env:AUTO_CREATE_TABLES = 'true'
```

## 使用 Docker Compose 启动（推荐用于有 MySQL 依赖时）

```powershell
cd backend-test
docker-compose up --build
```

服务启动后，API 根路径：`http://localhost:8080/`，OpenAPI 文档：`http://localhost:8080/docs`。

## 在虚拟环境中本地启动（不使用 Docker）

```powershell
cd backend-test
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
# 可选：设置使用 sqlite 回退（便于测试）
$env:DATABASE_URL = "sqlite+pysqlite:///$(Resolve-Path .\test_db.sqlite)"
$env:AUTO_CREATE_TABLES = 'true'
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## 快速 smoke test（curl 示例）

```powershell
# 根路径
curl http://localhost:8080/

# 注册（JSON）
curl -X POST http://localhost:8080/api/v1/auth/register -H "Content-Type: application/json" -d '{"nickname":"test","email":"test@example.com","password":"pass123"}'

# 登录（form 表单，OAuth2PasswordRequestForm）
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=test@example.com&password=pass123"
```

## 运行示例集成测试（pytest）

示例测试文件位于 `tests/test_integration_auth_posts.py`（在 `backend-test` 目录下），使用 FastAPI 的 TestClient 对 API 做端到端风格的测试（在 sqlite 临时 DB 上运行）。

运行命令：

```powershell
cd backend-test
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest backend-test/tests/test_integration_auth_posts.py -q
```

注：测试文件会在运行前设置一个临时 sqlite 数据库文件并启动 FastAPI 的 startup hook 来创建表。

## 常见问题
- 如果 `uvicorn` 启动时报 DB 连接错误，可检查 `DATABASE_URL` 或启用 `SQLITE_FALLBACK=true`。
- 上传文件路径（开发）在 `backend-test/app/uploads`，生产请替换为对象存储。

---
文档由自动化脚本生成，用于本地开发与 CI 集成测试示例。如需我把 README 添加到前端目录或生成 CI 工作流（GitHub Actions），请告诉我。
