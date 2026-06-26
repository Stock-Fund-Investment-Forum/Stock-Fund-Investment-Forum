import pytest
from fastapi.testclient import TestClient


def register_and_auth(client: TestClient):
    email = "commenter@example.com"
    password = "pass1234"
    resp = client.post(
        "/api/v1/auth/register",
        json={"nickname": "commenter", "email": email, "password": password},
    )
    assert resp.status_code == 201
    resp2 = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token = resp2.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_comment_lifecycle(client: TestClient):
    headers = register_and_auth(client)

    # create board and post
    b = client.post(
        "/api/v1/boards", json={"name": "CBoard", "category": "GENERAL"}, headers=headers
    )
    assert b.status_code == 201
    board_id = b.json()["board_id"]

    p = client.post(
        "/api/v1/posts",
        json={"title": "Post for comments", "content": "Body", "board_id": board_id},
        headers=headers,
    )
    assert p.status_code == 201
    post_id = p.json()["post_id"]

    # create comment
    c = client.post(
        "/api/v1/comments", json={"post_id": post_id, "content": "Nice post"}, headers=headers
    )
    assert c.status_code == 201
    comment = c.json()
    comment_id = comment["comment_id"]

    blank_parent = client.post(
        "/api/v1/comments",
        json={"post_id": post_id, "content": "Blank parent", "parent_comment_id": ""},
        headers=headers,
    )
    assert blank_parent.status_code == 201
    assert blank_parent.json()["parent_comment_id"] is None

    # get comment
    g = client.get(f"/api/v1/comments/{comment_id}")
    assert g.status_code == 200
    assert g.json()["content"] == "Nice post"

    # list comments
    lst = client.get(f"/api/v1/comments?post_id={post_id}")
    assert lst.status_code == 200
    assert any(x["comment_id"] == comment_id for x in lst.json())

    # unlike when not liked => should be idempotent and return 200
    pre_ul = client.post(f"/api/v1/comments/{comment_id}/unlike", headers=headers)
    assert pre_ul.status_code == 200
    gc_pre = client.get(f"/api/v1/comments/{comment_id}")
    assert gc_pre.status_code == 200
    assert gc_pre.json()["like_count"] == 0

    # like then unlike
    lk = client.post(f"/api/v1/comments/{comment_id}/like", headers=headers)
    assert lk.status_code == 200
    gc = client.get(f"/api/v1/comments/{comment_id}")
    assert gc.status_code == 200
    assert gc.json()["like_count"] == 1

    ul = client.post(f"/api/v1/comments/{comment_id}/unlike", headers=headers)
    assert ul.status_code == 200
    gc2 = client.get(f"/api/v1/comments/{comment_id}")
    assert gc2.status_code == 200
    assert gc2.json()["like_count"] == 0
