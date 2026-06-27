def test_employee_cannot_access_admin(client, employee_token):
    res = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 403

def test_admin_can_access_admin(client, admin_token):
    res = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200

def test_employee_cannot_upload_docs(client, employee_token):
    res = client.post("/documents/upload", headers={"Authorization": f"Bearer {employee_token}"}, data={"title": "test"})
    assert res.status_code == 403
