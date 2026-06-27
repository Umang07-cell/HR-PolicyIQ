def test_list_documents(client, admin_token):
    res = client.get("/documents/", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)
