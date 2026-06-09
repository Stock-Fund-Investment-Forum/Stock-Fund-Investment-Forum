from fastapi.testclient import TestClient


def test_engagement_add_and_prevent_duplicate(client: TestClient):
    # register and login
    resp = client.post("/auth/register", json={"nickname": "enguser", "email": "eng@example.com", "password": "pw"})
    assert resp.status_code == 201

    login = client.post("/auth/login", data={"username": "eng@example.com", "password": "pw"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"content_id": "post123", "content_type": "POST", "engagement_type": "LIKE"}
    create = client.post("/engagements", json=payload, headers=headers)
    assert create.status_code == 201

    # duplicate
    dup = client.post("/engagements", json=payload, headers=headers)
    assert dup.status_code == 400

    # remove
    rem = client.request("DELETE", "/engagements", json=payload, headers=headers)
    assert rem.status_code == 200

    # re-add after remove
    readd = client.post("/engagements", json=payload, headers=headers)
    assert readd.status_code == 201
