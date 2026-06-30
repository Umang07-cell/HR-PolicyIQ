"""E2E: manager role coverage.

After removing leave/payroll/grievance/performance, the manager role has
no distinct surviving behavior in the backend — get_current_user does not
discriminate by role, and require_role() only branches on hr_admin /
executive. This file exists to make that explicit and assert it stays
true (manager gets the same access as employee, and is still correctly
blocked from admin-only endpoints) rather than silently dropping manager
coverage.
"""
import pytest


def test_manager_has_employee_level_access(client, manager_token):
    headers = {"Authorization": f"Bearer {manager_token}"}

    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == "manager"

    # Manager can use the HR Assistant same as any authenticated user
    chat_res = client.post(
        "/chat/",
        json={"query": "What is the grievance redressal process?"},
        headers=headers,
    )
    assert chat_res.status_code == 200
    assert "answer" in chat_res.json()

    # Manager can list documents
    assert client.get("/documents/", headers=headers).status_code == 200

    # Manager still cannot upload (same as employee — no manager-specific
    # upload permission exists in documents.py)
    upload_res = client.post(
        "/documents/upload",
        headers=headers,
        data={"title": "test"},
    )
    assert upload_res.status_code == 403


def test_manager_cannot_access_admin_endpoints(client, manager_token):
    headers = {"Authorization": f"Bearer {manager_token}"}
    assert client.get("/admin/dashboard", headers=headers).status_code == 403
    assert client.get("/admin/users", headers=headers).status_code == 403
    assert client.get("/admin/audit-logs", headers=headers).status_code == 403
