import pytest
from fastapi.testclient import TestClient


def register_and_auth(client: TestClient):
    email = "stocker@example.com"
    password = "pass1234"
    resp = client.post(
        "/api/v1/auth/register",
        json={"nickname": "stocker", "email": email, "password": password},
    )
    assert resp.status_code == 201
    resp2 = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    assert resp2.status_code == 200
    token = resp2.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_stock_and_discussions(client: TestClient):
    headers = register_and_auth(client)

    # create stock
    s = client.post(
        "/api/v1/stocks",
        json={"symbol": "TST", "name": "Test Co", "last_price": 12.34},
        headers=headers,
    )
    assert s.status_code == 201
    stock = s.json()
    stock_id = stock["stock_id"]

    # list stocks
    lst = client.get("/api/v1/stocks")
    assert lst.status_code == 200
    assert any(x["stock_id"] == stock_id for x in lst.json())

    # get stock
    g = client.get(f"/api/v1/stocks/{stock_id}")
    assert g.status_code == 200
    assert g.json()["symbol"] == "TST"

    # create discussion
    d = client.post(f"/api/v1/stocks/{stock_id}/discussions", json={"content": "Hello ticker"}, headers=headers)
    assert d.status_code == 201
    disc = d.json()
    disc_id = disc["discussion_id"]

    # list discussions
    ld = client.get(f"/api/v1/stocks/{stock_id}/discussions")
    assert ld.status_code == 200
    assert any(x["discussion_id"] == disc_id for x in ld.json())
