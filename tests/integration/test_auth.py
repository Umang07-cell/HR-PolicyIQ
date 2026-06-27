def test_login_success(client, admin_token):
    assert admin_token is not None and len(admin_token) > 10

def test_login_wrong_password(client):
    res = client.post("/auth/login", json={"email": "test_admin@hr.com", "password": "wrong"})
    assert res.status_code == 401

def test_get_me(client, admin_token):
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert "email" in res.json()

def test_me_no_token(client):
    res = client.get("/auth/me")
    assert res.status_code == 403
