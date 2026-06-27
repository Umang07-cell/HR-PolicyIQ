def test_leave_request_create(client, employee_token):
    res = client.post("/leave/request", json={"leave_type": "casual", "start_date": "2026-08-01", "end_date": "2026-08-02"},
                      headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 200
    assert res.json()["status"] == "pending"

def test_grievance_create(client, employee_token):
    res = client.post("/grievance/", json={"title": "Test", "description": "Test grievance", "priority": "low"},
                      headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 200
