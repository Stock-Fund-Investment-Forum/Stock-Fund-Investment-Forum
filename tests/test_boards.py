import uuid

from fastapi.testclient import TestClient


def register_and_auth(client: TestClient):
    suffix = uuid.uuid4().hex[:8]
    email = f"boarder-{suffix}@example.com"
    password = "pass1234"
    resp = client.post(
        "/auth/register",
        json={"nickname": f"boarder-{suffix}", "email": email, "password": password},
    )
    assert resp.status_code == 201
    resp2 = client.post("/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token = resp2.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_board_rejects_invalid_category(client: TestClient):
    headers = register_and_auth(client)

    resp = client.post(
        "/boards",
        json={"name": "BadBoard", "category": "lysb1", "description": "invalid"},
        headers=headers,
    )

    assert resp.status_code == 422


def test_create_board_accepts_valid_category(client: TestClient):
    headers = register_and_auth(client)

    resp = client.post(
        "/boards",
        json={"name": "GoodBoard", "category": "GENERAL", "description": "valid"},
        headers=headers,
    )

    assert resp.status_code == 201
    assert resp.json()["category"] == "GENERAL"