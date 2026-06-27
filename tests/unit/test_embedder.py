import pytest

def test_embed_texts_shape():
    pytest.importorskip("sentence_transformers")
    from app.rag.embedder import embed_texts
    embeddings = embed_texts(["test text"])
    assert len(embeddings) == 1
    assert len(embeddings[0]) > 0

def test_embed_query_returns_list():
    pytest.importorskip("sentence_transformers")
    from app.rag.embedder import embed_query
    result = embed_query("test query")
    assert isinstance(result, list)
