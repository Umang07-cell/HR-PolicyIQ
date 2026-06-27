def test_hr_admin_full_flow(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    assert client.get("/admin/dashboard", headers=headers).status_code == 200
    assert client.get("/admin/users", headers=headers).status_code == 200
    assert client.get("/admin/audit-logs", headers=headers).status_code == 200
    assert client.get("/grievance/all", headers=headers).status_code == 200
