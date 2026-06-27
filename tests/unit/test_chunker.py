import pytest
from app.ingestion.chunker import chunk_pages

def test_basic_chunking():
    pages = [{"page": 1, "text": " ".join(["word"] * 600)}]
    chunks = chunk_pages(pages, chunk_size=512, overlap=64)
    assert len(chunks) >= 1
    assert all("text" in c for c in chunks)

def test_empty_pages():
    assert chunk_pages([]) == []

def test_chunk_has_required_fields():
    pages = [{"page": 1, "text": "Hello world this is a test document."}]
    chunks = chunk_pages(pages)
    for c in chunks:
        assert "text" in c and "page" in c and "chunk_index" in c
