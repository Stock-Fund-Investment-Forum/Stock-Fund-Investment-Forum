import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_user_crud_and_follow(client: TestClient):
    # create user A
    resp = client.post(
        "/api/v1/users",
        json={
            "nickname": "usera",
            "email": "a@example.com",
            "password": "pw12345",
        },
    )
    assert resp.status_code == 201
    a = resp.json()

    # create user B
    resp2 = client.post(
        "/api/v1/users",
        json={"nickname": "userb", "email": "b@example.com", "password": "pw2"},
    )
    assert resp2.status_code == 201
    b = resp2.json()

    # list users
    list_resp = client.get("/api/v1/users?page=1&per_page=10")
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert any(u["email"] == "a@example.com" for u in data)

    # login as A
    resp_login = client.post("/api/v1/auth/login", data={"username": "a@example.com", "password": "pw12345"})
    assert resp_login.status_code == 200
    token = resp_login.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # get current user
    me = client.get("/api/v1/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"

    # update user A
    upd = client.put(
        f"/api/v1/users/{a['user_id']}", json={"nickname": "usera2", "email": "a@example.com"}, headers=headers
    )
    assert upd.status_code == 200
    assert upd.json()["nickname"] == "usera2"

    # follow B
    follow = client.post(f"/api/v1/users/{b['user_id']}/follow", headers=headers)
    assert follow.status_code == 201

    # unfollow B
    unf = client.post(f"/api/v1/users/{b['user_id']}/unfollow", headers=headers)
    assert unf.status_code == 200

    # delete user A (soft delete)
    delr = client.delete(f"/api/v1/users/{a['user_id']}", headers=headers)
    assert delr.status_code == 204

    # ensure not in list
    list_resp2 = client.get("/api/v1/users?page=1&per_page=10")
    assert all(u["email"] != "a@example.com" for u in list_resp2.json())
