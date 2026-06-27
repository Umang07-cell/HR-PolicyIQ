def test_chat_requires_auth(client):
    res = client.post("/chat/", json={"query": "what is the leave policy"})
    assert res.status_code == 403

def test_chat_returns_schema(client, employee_token):
    res = client.post("/chat/", json={"query": "leave policy"}, headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data and "citations" in data and "confidence" in data
