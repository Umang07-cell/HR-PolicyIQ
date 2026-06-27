import pytest

@pytest.mark.asyncio
async def test_pipeline_no_chunks_returns_fallback():
    from unittest.mock import patch
    from app.rag.pipeline import run_rag_pipeline
    with patch("app.rag.pipeline.retrieve_chunks", return_value=[]):
        result = await run_rag_pipeline("test query", "employee")
        assert "citations" in result
        assert result["confidence"] == 0.0
