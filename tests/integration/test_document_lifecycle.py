"""Integration tests for document upload and lifecycle."""
import pytest
import io


def test_list_documents_requires_auth(client):
    res = client.get("/documents/")
    assert res.status_code in (401, 403)


def test_list_documents_as_admin(client, admin_token):
    res = client.get("/documents/", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_list_documents_as_employee(client, employee_token):
    res = client.get("/documents/", headers={"Authorization": f"Bearer {employee_token}"})
    assert res.status_code == 200


def test_upload_requires_hr_admin(client, employee_token):
    res = client.post(
        "/documents/upload",
        headers={"Authorization": f"Bearer {employee_token}"},
        data={"title": "Test"},
        files={"file": ("test.txt", io.BytesIO(b"content"), "text/plain")},
    )
    assert res.status_code == 403


def test_upload_invalid_module_rejected(client, admin_token):
    res = client.post(
        "/documents/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={"title": "Test", "module": "invalid_module"},
        files={"file": ("test.txt", io.BytesIO(b"content"), "text/plain")},
    )
    assert res.status_code == 400


def test_upload_unsupported_type_rejected(client, admin_token):
    res = client.post(
        "/documents/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={"title": "Test", "module": "policy"},
        files={"file": ("test.exe", io.BytesIO(b"MZ\x90\x00"), "application/octet-stream")},
    )
    assert res.status_code == 415


def test_upload_valid_txt_document(client, admin_token):
    content = b"This is a test HR policy document with enough content for processing."
    res = client.post(
        "/documents/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={"title": "Test Policy", "module": "policy", "access_roles": "employee,hr_admin"},
        files={"file": ("policy.txt", io.BytesIO(content), "text/plain")},
    )
    assert res.status_code in (200, 202)
    data = res.json()
    assert data["title"] == "Test Policy"
    assert "id" in data


def test_list_documents_pagination(client, admin_token):
    res = client.get("/documents/?skip=0&limit=5", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert len(res.json()) <= 5
