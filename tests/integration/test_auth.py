"""Integration tests for authentication."""
import pytest


def test_login_success(client, admin_token):
    assert admin_token is not None
    assert len(admin_token) > 10


def test_login_wrong_password(client):
    res = client.post("/auth/login", json={"email": "test_admin@hr.com", "password": "wrongpassword"})
    assert res.status_code == 401


def test_login_nonexistent_user(client):
    res = client.post("/auth/login", json={"email": "nobody@hr.com", "password": "password123"})
    assert res.status_code == 401


def test_login_short_password_rejected(client):
    res = client.post("/auth/login", json={"email": "test_admin@hr.com", "password": "short"})
    assert res.status_code == 422


def test_get_me(client, admin_token):
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "email" in data
    assert data["email"] == "test_admin@hr.com"


def test_me_no_token(client):
    res = client.get("/auth/me")
    assert res.status_code in (401, 403)


def test_employee_token_works(client, employee_token):
    assert employee_token is not None
    assert len(employee_token) > 10


def test_manager_token_works(client, manager_token):
    assert manager_token is not None
    assert len(manager_token) > 10
