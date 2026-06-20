import pytest
from fastapi.testclient import TestClient


def test_register_and_login(client: TestClient):
    email = "alice@example.com"
    password = "strongpassword"
    # register
    resp = client.post(
        "/api/v1/auth/register",
        json={"nickname": "alice", "email": email, "password": password},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == email

    # login (OAuth2PasswordRequestForm expects form data with username)
    resp2 = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token_data = resp2.json()
    assert "access_token" in token_data

    # access protected endpoint
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me = client.get("/api/v1/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_register_duplicate_nickname_returns_400(client: TestClient):
    first = client.post(
        "/api/v1/auth/register",
        json={
            "nickname": "dupname",
            "email": "dup1@example.com",
            "password": "strongpassword",
        },
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/auth/register",
        json={
            "nickname": "dupname",
            "email": "dup2@example.com",
            "password": "strongpassword",
        },
    )
    assert second.status_code == 400
    assert second.json()["detail"] == "Nickname already taken"
