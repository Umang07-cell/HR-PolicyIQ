"""Integration tests for the chat API."""
import pytest
from unittest.mock import patch, AsyncMock


def test_chat_requires_auth(client):
    res = client.post("/chat/", json={"query": "what is the leave policy"})
    assert res.status_code in (401, 403)


def test_chat_empty_query_rejected(client, employee_token):
    res = client.post(
        "/chat/",
        json={"query": "   "},
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert res.status_code == 400


def test_chat_query_too_long_rejected(client, employee_token):
    res = client.post(
        "/chat/",
        json={"query": "x" * 2001},
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert res.status_code == 400


def test_chat_invalid_module_rejected(client, employee_token):
    res = client.post(
        "/chat/",
        json={"query": "test", "module": "hacking"},
        headers={"Authorization": f"Bearer {employee_token}"},
    )
    assert res.status_code == 400


def test_chat_returns_required_schema(client, employee_token):
    with patch("app.rag.pipeline.retrieve_chunks", return_value=[]), \
         patch("app.rag.pipeline.should_abstain", return_value=True):
        res = client.post(
            "/chat/",
            json={"query": "leave policy"},
            headers={"Authorization": f"Bearer {employee_token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "citations" in data
    assert "confidence" in data
    assert "confidence_label" in data


def test_chat_abstain_returns_low_confidence(client, employee_token):
    with patch("app.rag.pipeline.retrieve_chunks", return_value=[]):
        res = client.post(
            "/chat/",
            json={"query": "something very obscure"},
            headers={"Authorization": f"Bearer {employee_token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert data["confidence"] == 0.0
    assert data["confidence_label"] == "low"
    assert data["llm_called"] is False
