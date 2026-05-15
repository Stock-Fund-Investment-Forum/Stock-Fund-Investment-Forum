import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite+pysqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    # create tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


def test_register_and_login(client: TestClient):
    email = "alice@example.com"
    password = "strongpassword"
    # register
    resp = client.post(
        "/auth/register",
        json={"nickname": "alice", "email": email, "password": password},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == email

    # login (OAuth2PasswordRequestForm expects form data with username)
    resp2 = client.post("/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token_data = resp2.json()
    assert "access_token" in token_data

    # access protected endpoint
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me = client.get("/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_register_duplicate_nickname_returns_400(client: TestClient):
    first = client.post(
        "/auth/register",
        json={
            "nickname": "dupname",
            "email": "dup1@example.com",
            "password": "strongpassword",
        },
    )
    assert first.status_code == 201

    second = client.post(
        "/auth/register",
        json={
            "nickname": "dupname",
            "email": "dup2@example.com",
            "password": "strongpassword",
        },
    )
    assert second.status_code == 400
    assert second.json()["detail"] == "Nickname already taken"
