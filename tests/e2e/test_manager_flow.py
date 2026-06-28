"""E2E: complete manager journey."""
import pytest


def test_manager_full_flow(client, manager_token, employee_token):
    mgr_headers = {"Authorization": f"Bearer {manager_token}"}
    emp_headers = {"Authorization": f"Bearer {employee_token}"}

    # Manager auth
    me = client.get("/auth/me", headers=mgr_headers)
    assert me.status_code == 200
    assert me.json()["role"] == "manager"

    # Employee submits a leave request
    leave_res = client.post(
        "/leave/request",
        json={"leave_type": "casual", "start_date": "2026-10-01", "end_date": "2026-10-01"},
        headers=emp_headers,
    )
    assert leave_res.status_code == 200
    leave_id = leave_res.json()["id"]

    # Manager views pending leaves
    pending = client.get("/leave/pending", headers=mgr_headers)
    assert pending.status_code == 200
    assert isinstance(pending.json(), list)

    # Manager approves the leave
    action_res = client.post(
        f"/leave/{leave_id}/action",
        json={"action": "approve", "comment": "Approved via E2E test"},
        headers=mgr_headers,
    )
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "approved"

    # Manager views team performance
    assert client.get("/performance/team", headers=mgr_headers).status_code == 200

    # Manager cannot access admin endpoints
    assert client.get("/admin/dashboard", headers=mgr_headers).status_code == 403
    assert client.get("/admin/users", headers=mgr_headers).status_code == 403
