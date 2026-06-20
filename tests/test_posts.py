import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import database as app_database
from app.database import Base
from app import models


def register_and_auth(client: TestClient):
    suffix = uuid.uuid4().hex[:8]
    email = f"poster-{suffix}@example.com"
    password = "pass1234"
    resp = client.post(
        "/api/v1/auth/register",
        json={"nickname": f"poster-{suffix}", "email": email, "password": password},
    )
    assert resp.status_code == 201
    resp2 = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token = resp2.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_post_lifecycle(client: TestClient):
    headers = register_and_auth(client)

    # create board
    b = client.post(
        "/api/v1/boards", json={"name": "TestBoard", "category": "GENERAL"}, headers=headers
    )
    assert b.status_code == 201
    board_id = b.json()["board_id"]

    # create post
    p = client.post(
        "/api/v1/posts",
        json={"title": "Hello", "content": "World", "board_id": board_id},
        headers=headers,
    )
    assert p.status_code == 201
    post = p.json()
    post_id = post["post_id"]

    # get post increases view
    g = client.get(f"/api/v1/posts/{post_id}")
    assert g.status_code == 200
    assert g.json()["view_count"] == 1

    # list posts
    lst = client.get("/api/v1/posts")
    assert lst.status_code == 200
    assert any(x["post_id"] == post_id for x in lst.json())

    # like
    like = client.post(f"/api/v1/posts/{post_id}/like", headers=headers)
    assert like.status_code == 200
    gp = client.get(f"/api/v1/posts/{post_id}")
    assert gp.status_code == 200
    assert gp.json()["like_count"] == 1

    # unlike
    unlike = client.post(f"/api/v1/posts/{post_id}/unlike", headers=headers)
    assert unlike.status_code == 200
    gp2 = client.get(f"/api/v1/posts/{post_id}")
    assert gp2.status_code == 200
    assert gp2.json()["like_count"] == 0


def test_delete_post_sets_deleted_flags(client: TestClient):
    headers = register_and_auth(client)

    b = client.post(
        "/api/v1/boards", json={"name": "DeleteBoard", "category": "GENERAL"}, headers=headers
    )
    assert b.status_code == 201
    board_id = b.json()["board_id"]

    p = client.post(
        "/api/v1/posts",
        json={"title": "To delete", "content": "Body", "board_id": board_id},
        headers=headers,
    )
    assert p.status_code == 201
    post_id = p.json()["post_id"]

    deleted = client.delete(f"/api/v1/posts/{post_id}", headers=headers)
    assert deleted.status_code == 200

    detail = client.get(f"/api/v1/posts/{post_id}")
    assert detail.status_code == 404

    all_posts = client.get("/api/v1/posts?include_deleted=true")
    assert all_posts.status_code == 200
    deleted_post = next(x for x in all_posts.json() if x["post_id"] == post_id)
    assert deleted_post["status"] == "DELETED"
    assert deleted_post["is_deleted"] is True


def test_include_deleted_survives_invalid_post_status(monkeypatch):
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    Base.metadata.create_all(bind=test_engine)

    with test_engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO users (user_id, nickname, email, hashed_password) VALUES (:id, :nickname, :email, :password)"
            ),
            {
                "id": "u1",
                "nickname": "u",
                "email": "u@example.com",
                "password": "hashed",
            },
        )
        conn.execute(
            text(
                "INSERT INTO boards (board_id, name, category, is_active, post_count, member_count) VALUES (:id, :name, :category, 1, 0, 0)"
            ),
            {"id": "b1", "name": "board", "category": "GENERAL"},
        )
        conn.execute(
            text(
                "INSERT INTO posts (post_id, user_id, board_id, title, content, post_type, status, audit_status, view_count, like_count, comment_count, is_essence, is_deleted) "
                "VALUES (:post_id, :user_id, :board_id, :title, :content, :post_type, :status, :audit_status, 0, 0, 0, 0, 0)"
            ),
            {
                "post_id": "p1",
                "user_id": "u1",
                "board_id": "b1",
                "title": "bad",
                "content": "bad",
                "post_type": "DISCUSSION",
                "status": "stringd",
                "audit_status": "APPROVED",
            },
        )

    monkeypatch.setattr(app_database, "engine", test_engine)
    app_database.cleanup_invalid_post_enums()

    db = TestSessionLocal()
    try:
        post = db.query(models.Post).filter(models.Post.post_id == "p1").first()
        assert post is not None
        assert post.status == models.PostStatus.DELETED
    finally:
        db.close()
