import pathlib


def test_register_login_create_post_flow(client):
    # 1) 注册
    register_payload = {
        "nickname": "testuser",
        "email": "testuser@example.com",
        "password": "pass12345"
    }
    r = client.post("/api/v1/auth/register", json=register_payload)
    assert r.status_code == 201, r.text
    user = r.json()
    assert user.get("nickname") == "testuser"

    # 2) 登录（使用 OAuth2 password form）
    login_data = {
        "username": register_payload["email"],
        "password": register_payload["password"]
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 200, r.text
    token = r.json().get("access_token") or r.json().get("token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}

    # 3) 创建板块（任何登录用户可创建）
    board_payload = {"name": "Test Board", "category": "GENERAL"}
    r = client.post("/api/v1/boards", json=board_payload, headers=headers)
    assert r.status_code == 201, r.text
    board = r.json()
    board_id = board.get("board_id")
    assert board_id

    # 4) 创建帖子
    post_payload = {"board_id": board_id, "title": "Hello Test", "content": "This is a test post", "tags": []}
    r = client.post("/api/v1/posts", json=post_payload, headers=headers)
    assert r.status_code == 201, r.text
    post = r.json()
    post_id = post.get("post_id")
    assert post_id

    # 5) 获取帖子并验证内容
    r = client.get(f"/api/v1/posts/{post_id}")
    assert r.status_code == 200, r.text
    got = r.json()
    assert got.get("title") == post_payload["title"]

