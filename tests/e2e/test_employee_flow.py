"""E2E: employee journey against the policy-only platform.

Leave/payroll/grievance/performance modules were removed; this covers what
an employee can actually do now: authenticate, ask the HR Assistant a
question, list visible documents, and confirm role-gated endpoints stay
blocked.
"""
import pytest


def test_employee_full_flow(client, employee_token):
    headers = {"Authorization": f"Bearer {employee_token}"}

    # Auth
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == "employee"

    # HR Assistant chat — with no documents seeded, the pipeline abstains
    # cleanly rather than erroring, so this checks the contract, not content.
    chat_res = client.post(
        "/chat/",
        json={"query": "What is the work from home policy?"},
        headers=headers,
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "answer" in chat_data
    assert "citations" in chat_data
    assert "confidence" in chat_data

    # Chat feedback submission
    feedback_res = client.post(
        "/chat/feedback",
        json={"query": "What is the work from home policy?", "is_positive": True},
        headers=headers,
    )
    assert feedback_res.status_code == 200

    # Document listing (employees can list, not upload)
    docs_res = client.get("/documents/", headers=headers)
    assert docs_res.status_code == 200
    assert isinstance(docs_res.json(), list)

    # Employees cannot upload documents
    upload_res = client.post(
        "/documents/upload",
        headers=headers,
        data={"title": "test"},
    )
    assert upload_res.status_code == 403

    # Blocked admin endpoints
    assert client.get("/admin/dashboard", headers=headers).status_code == 403
    assert client.get("/admin/users", headers=headers).status_code == 403
