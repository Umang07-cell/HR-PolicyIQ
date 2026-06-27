def test_employee_full_flow(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}
    assert client.get("/auth/me", headers=headers).status_code == 200
    assert client.get("/leave/my", headers=headers).status_code == 200
    assert client.get("/payroll/my", headers=headers).status_code == 200
    assert client.get("/grievance/my", headers=headers).status_code == 200
    assert client.get("/performance/my", headers=headers).status_code == 200
