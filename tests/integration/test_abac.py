"""Integration tests for ABAC role-based access control."""
import pytest


def test_employee_cannot_access_admin(client, employee_token):
    res = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 403


def test_admin_can_access_admin(client, admin_token):
    res = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200


def test_employee_cannot_upload_docs(client, employee_token):
    res = client.post(
        "/documents/upload",
        headers={"Authorization": f"Bearer {employee_token}"},
        data={"title": "test"},
    )
    assert res.status_code == 403


def test_admin_can_list_users(client, admin_token):
    res = client.get("/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_employee_cannot_list_admin_users(client, employee_token):
    res = client.get("/admin/users", headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 403


def test_employee_cannot_access_audit_logs(client, employee_token):
    res = client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 403


def test_manager_cannot_access_admin_dashboard(client, manager_token):
    res = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {manager_token}"})
    assert res.status_code == 403


def test_unauthenticated_request_rejected(client):
    res = client.get("/admin/dashboard")
    assert res.status_code in (401, 403)
