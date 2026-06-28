"""E2E: complete HR admin journey."""
import pytest
import io


def test_hr_admin_full_flow(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Auth
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == "hr_admin"

    # Admin dashboard
    dash = client.get("/admin/dashboard", headers=headers)
    assert dash.status_code == 200
    data = dash.json()
    assert "total_users" in data
    assert "total_documents" in data

    # User list
    users = client.get("/admin/users", headers=headers)
    assert users.status_code == 200
    assert isinstance(users.json(), list)

    # Audit logs
    logs = client.get("/admin/audit-logs", headers=headers)
    assert logs.status_code == 200
    assert isinstance(logs.json(), list)

    # Grievances
    grievances = client.get("/grievance/all", headers=headers)
    assert grievances.status_code == 200

    # Document upload
    content = b"HR Test Policy: Employees are entitled to 12 casual leaves per year."
    upload = client.post(
        "/documents/upload",
        headers=headers,
        data={"title": "E2E Test Policy", "module": "policy", "access_roles": "employee,hr_admin"},
        files={"file": ("e2e_policy.txt", io.BytesIO(content), "text/plain")},
    )
    assert upload.status_code in (200, 202)
    doc_id = upload.json().get("id")
    assert doc_id is not None

    # Document status check
    status = client.get(f"/documents/{doc_id}/status", headers=headers)
    assert status.status_code == 200
    assert "is_indexed" in status.json()
