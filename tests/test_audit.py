import pytest
from fastapi.testclient import TestClient


def register_and_auth(client: TestClient):
    email = "auditor@example.com"
    password = "pass1234"
    resp = client.post(
        "/auth/register",
        json={"nickname": "auditor", "email": email, "password": password},
    )
    assert resp.status_code == 201
    resp2 = client.post("/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token = resp2.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_report_and_resolve_violation(client: TestClient):
    headers = register_and_auth(client)

    # create board and post to be target
    b = client.post("/boards", json={"name": "ABoard", "category": "GENERAL"}, headers=headers)
    assert b.status_code == 201
    board_id = b.json()["board_id"]

    p = client.post(
        "/posts",
        json={"title": "Post To Report", "content": "Bad", "board_id": board_id},
        headers=headers,
    )
    assert p.status_code == 201
    post_id = p.json()["post_id"]

    # report violation
    r = client.post(
        "/audit/violations",
        json={"target_type": "POST", "target_id": post_id, "reason": "spam"},
        headers=headers,
    )
    assert r.status_code == 201
    viol = r.json()
    vid = viol["violation_id"]

    # list violations
    lv = client.get("/audit/violations")
    assert lv.status_code == 200
    assert any(x["violation_id"] == vid for x in lv.json())

    # resolve
    res = client.post(f"/audit/violations/{vid}/resolve?status=APPROVED", headers=headers)
    assert res.status_code == 200
    v2 = res.json()
    assert v2["status"] == "APPROVED"
