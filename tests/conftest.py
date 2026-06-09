import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.main import app
from app.database import Base, get_db

# 1. 创建内存数据库引擎
engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 2. Session 级别 Fixture：整个测试过程只建一次表（提升速度）
@pytest.fixture(scope="session")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# 3. Function 级别 Fixture：每个测试用例独享一个事务，结束即回滚
@pytest.fixture()
def db_session(setup_database):
    connection = engine.connect()
    # 开启外层事务
    transaction = connection.begin()
    
    # 绑定到当前连接的 Session
    Session = scoped_session(sessionmaker(bind=connection))
    session = Session()

    yield session  # 提供给测试用例使用

    # 【核心】无论测试成功还是失败，强制回滚所有操作，保证环境绝对干净！
    session.close()
    transaction.rollback()
    connection.close()

# 4. Client Fixture：覆盖 FastAPI 依赖，确保接口请求也走隔离的 Session
@pytest.fixture()
def client(db_session):
    # 让 FastAPI 路由在处理请求时，使用我们隔离的 db_session
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
    # 测试结束后清除覆盖，避免影响其他非测试代码
    app.dependency_overrides.clear()