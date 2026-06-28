"""E2E: complete employee journey."""
import pytest


def test_employee_full_flow(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}

    # Auth
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == "employee"

    # Leave
    assert client.get("/leave/my", headers=headers).status_code == 200

    leave_res = client.post(
        "/leave/request",
        json={"leave_type": "casual", "start_date": "2026-09-10", "end_date": "2026-09-11"},
        headers=headers,
    )
    assert leave_res.status_code == 200
    assert leave_res.json()["status"] == "pending"

    # Payroll
    assert client.get("/payroll/my", headers=headers).status_code == 200

    # Grievance
    g_res = client.post(
        "/grievance/",
        json={"title": "E2E Test", "description": "End to end test grievance", "priority": "low"},
        headers=headers,
    )
    assert g_res.status_code == 200
    assert client.get("/grievance/my", headers=headers).status_code == 200

    # Performance
    assert client.get("/performance/my", headers=headers).status_code == 200

    # Documents (list, not upload)
    assert client.get("/documents/", headers=headers).status_code == 200

    # Blocked endpoints
    assert client.get("/admin/dashboard", headers=headers).status_code == 403
    assert client.get("/admin/users", headers=headers).status_code == 403
    assert client.get("/leave/pending", headers=headers).status_code == 403
