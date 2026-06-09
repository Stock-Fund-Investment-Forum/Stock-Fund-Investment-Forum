import io
from fastapi.testclient import TestClient


def test_multi_file_upload(client: TestClient):
    # register and login
    resp = client.post("/auth/register", json={"nickname": "attuser", "email": "att@example.com", "password": "pw"})
    assert resp.status_code == 201
    user = resp.json()

    login = client.post("/auth/login", data={"username": "att@example.com", "password": "pw"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    files = [
        ("files", ("a.txt", io.BytesIO(b"hello"), "text/plain")),
        ("files", ("b.txt", io.BytesIO(b"world"), "text/plain")),
    ]
    resp = client.post(f"/attachments?post_id=testpost", files=files, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert all("attachment_id" in a for a in data)
