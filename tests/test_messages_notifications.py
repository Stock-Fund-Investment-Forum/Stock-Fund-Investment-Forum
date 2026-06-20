from fastapi.testclient import TestClient


def test_messages_and_notifications_flow(client: TestClient):
    # create two users
    resp_a = client.post("/api/v1/users", json={"nickname": "alice2", "email": "alice2@example.com", "password": "pw"})
    assert resp_a.status_code == 201
    a = resp_a.json()

    resp_b = client.post("/api/v1/users", json={"nickname": "bob2", "email": "bob2@example.com", "password": "pw"})
    assert resp_b.status_code == 201
    b = resp_b.json()

    # login as A
    rlogin = client.post("/api/v1/auth/login", data={"username": "alice2@example.com", "password": "pw"})
    assert rlogin.status_code == 200
    token_a = rlogin.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # send message from A to B
    send = client.post("/api/v1/messages", json={"recipient_id": b["user_id"], "content": "hello bob"}, headers=headers_a)
    assert send.status_code == 201
    msg = send.json()
    assert msg["recipient_id"] == b["user_id"] or msg.get("recipient_id") == b["user_id"]

    # login as B and check unread count
    rlogin_b = client.post("/api/v1/auth/login", data={"username": "bob2@example.com", "password": "pw"})
    token_b = rlogin_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    unread = client.get("/api/v1/messages/unread_count", headers=headers_b)
    assert unread.status_code == 200
    assert unread.json()["unread"] >= 1

    # list notifications for B
    notifs = client.get("/api/v1/notifications", headers=headers_b)
    assert notifs.status_code == 200
    assert any(n["type"] == "MESSAGE" for n in notifs.json())

    # get conversation messages
    conv = client.get(f"/api/v1/messages/conversations/{a['user_id']}", headers=headers_b)
    assert conv.status_code == 200
    assert any(m["content"] == "hello bob" for m in conv.json())

    # mark messages read as B
    mr = client.post("/api/v1/messages/mark_read", headers=headers_b)
    assert mr.status_code == 200

    unread_after = client.get("/api/v1/messages/unread_count", headers=headers_b)
    assert unread_after.json()["unread"] == 0

    # mark notifications read
    mn = client.post("/api/v1/notifications/mark_read", headers=headers_b)
    assert mn.status_code == 200
    unread_notifs = client.get("/api/v1/notifications/unread_count", headers=headers_b)
    assert unread_notifs.status_code == 200
    assert unread_notifs.json()["unread"] == 0
