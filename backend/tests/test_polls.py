from fastapi.testclient import TestClient


def test_poll_create_and_vote(client: TestClient):
    # register user
    resp = client.post("/api/v1/auth/register", json={"nickname": "polluser", "email": "poll@example.com", "password": "pw"})
    assert resp.status_code == 201

    login = client.post("/api/v1/auth/login", data={"username": "poll@example.com", "password": "pw"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "post_id": "p1",
        "question": "Which?",
        "options": [{"text": "A"}, {"text": "B"}],
        "allow_multiple": False,
    }
    create = client.post("/api/v1/polls", json=payload, headers=headers)
    assert create.status_code == 201
    poll = create.json()

    poll_id = poll.get("poll_id")
    assert poll_id is not None
    options = poll.get("options")
    assert options and len(options) >= 2

    opt0 = options[0]["option_id"]

    # vote for option 0
    v1 = client.post(f"/api/v1/polls/{poll_id}/vote", json={"option_id": opt0}, headers=headers)
    assert v1.status_code == 200

    # attempt double vote (allow_multiple=False) should fail
    v2 = client.post(f"/api/v1/polls/{poll_id}/vote", json={"option_id": opt0}, headers=headers)
    assert v2.status_code == 400
