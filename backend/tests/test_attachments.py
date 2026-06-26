import io
from fastapi.testclient import TestClient


def test_multi_file_upload(client: TestClient):
    # register and login
    resp = client.post("/api/v1/auth/register", json={"nickname": "attuser", "email": "att@example.com", "password": "pw"})
    assert resp.status_code == 201
    user = resp.json()

    login = client.post("/api/v1/auth/login", data={"username": "att@example.com", "password": "pw"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a test post first
    post_resp = client.post("/api/v1/posts", json={
        "board_id": "test-board",
        "title": "Test Post for Attachments",
        "content": "Testing attachments",
        "post_type": "DISCUSSION"
    }, headers=headers)
    assert post_resp.status_code == 201
    post_id = post_resp.json()["post_id"]

    files = [
        ("files", ("a.txt", io.BytesIO(b"hello"), "text/plain")),
        ("files", ("b.txt", io.BytesIO(b"world"), "text/plain")),
    ]
    # Send post_id as form data, not query parameter
    data = {"post_id": post_id}
    resp = client.post("/api/v1/attachments", files=files, data=data, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert all("attachment_id" in a for a in data)
