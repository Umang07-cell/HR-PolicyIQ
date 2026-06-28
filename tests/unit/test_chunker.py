"""Unit tests for document chunker."""
import pytest
from app.ingestion.chunker import chunk_pages


def test_empty_pages():
    assert chunk_pages([]) == []


def test_basic_chunking():
    pages = [{"page": 1, "text": " ".join(["word"] * 600)}]
    chunks = chunk_pages(pages, chunk_size=512, overlap=64)
    assert len(chunks) >= 1
    assert all("text" in c for c in chunks)


def test_chunk_has_required_fields():
    pages = [{"page": 1, "text": "Hello world this is a test document with enough words to chunk."}]
    chunks = chunk_pages(pages)
    for c in chunks:
        assert "text" in c
        assert "page" in c
        assert "chunk_index" in c


def test_page_number_preserved():
    pages = [
        {"page": 3, "text": " ".join(["word"] * 100)},
    ]
    chunks = chunk_pages(pages)
    assert all(c["page"] == 3 for c in chunks)


def test_chunk_index_resets_per_page():
    pages = [
        {"page": 1, "text": " ".join(["word"] * 600)},
        {"page": 2, "text": " ".join(["word"] * 600)},
    ]
    chunks = chunk_pages(pages)
    page1 = [c for c in chunks if c["page"] == 1]
    page2 = [c for c in chunks if c["page"] == 2]
    # chunk_index should start from 0 for each page
    assert page1[0]["chunk_index"] == 0
    assert page2[0]["chunk_index"] == 0


def test_multi_page_all_pages_present():
    pages = [{"page": i, "text": " ".join(["word"] * 200)} for i in range(1, 4)]
    chunks = chunk_pages(pages)
    pages_in_chunks = {c["page"] for c in chunks}
    assert {1, 2, 3}.issubset(pages_in_chunks)


def test_short_text_single_chunk():
    pages = [{"page": 1, "text": "Short text."}]
    chunks = chunk_pages(pages)
    assert len(chunks) == 1
    assert chunks[0]["text"] == "Short text."


def test_empty_page_text_skipped():
    pages = [
        {"page": 1, "text": "   "},
        {"page": 2, "text": "Real content here."},
    ]
    chunks = chunk_pages(pages)
    page_numbers = [c["page"] for c in chunks]
    assert 1 not in page_numbers or all(c["text"].strip() for c in chunks if c["page"] == 1)
