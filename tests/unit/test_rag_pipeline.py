"""Unit tests for the RAG pipeline."""
import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_pipeline_empty_chunks_returns_abstain():
    from app.rag.pipeline import run_rag_pipeline
    with patch("app.rag.pipeline.retrieve_chunks", return_value=[]):
        result = await run_rag_pipeline(
            query="test query",
            role="employee",
            department=None,
            location=None,
            module=None,
            user_id=1,
        )
    assert "citations" in result
    assert result["confidence"] == 0.0
    assert result["llm_called"] is False
    assert "contact HR" in result["answer"]


@pytest.mark.asyncio
async def test_pipeline_cache_key_includes_module():
    from app.rag.pipeline import _cache_key
    key_with_module = _cache_key("query", "employee", "eng", "pune", "leave")
    key_no_module = _cache_key("query", "employee", "eng", "pune", "")
    assert key_with_module != key_no_module


@pytest.mark.asyncio
async def test_pipeline_returns_required_fields():
    from app.rag.pipeline import run_rag_pipeline

    mock_chunks = [
        {
            "id": "abc",
            "score": 0.03,
            "text": "Employees get 12 casual leaves per year.",
            "document_id": 1,
            "document_title": "Leave Policy",
            "chunk_index": 0,
            "page": 5,
        }
    ]

    with patch("app.rag.pipeline.retrieve_chunks", return_value=mock_chunks), \
         patch("app.rag.pipeline.rerank", return_value=mock_chunks), \
         patch("app.rag.pipeline._call_llm", new=AsyncMock(return_value="You get 12 casual leaves. [SOURCE 1]")):
        result = await run_rag_pipeline(
            query="how many casual leaves",
            role="employee",
            department=None,
            location=None,
            module="leave",
            user_id=1,
        )

    assert "answer" in result
    assert "citations" in result
    assert "confidence" in result
    assert "confidence_label" in result
    assert "llm_called" in result
    assert result["llm_called"] is True


@pytest.mark.asyncio
async def test_pipeline_cache_key_is_deterministic():
    from app.rag.pipeline import _cache_key
    k1 = _cache_key("  What is leave policy?  ", "employee", "eng", "pune", "leave")
    k2 = _cache_key("what is leave policy?", "employee", "eng", "pune", "leave")
    assert k1 == k2
