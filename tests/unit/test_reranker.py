from app.rag.reranker import rerank

def test_rerank_fallback_by_score():
    chunks = [{"text": "a", "score": 0.8}, {"text": "b", "score": 0.9}, {"text": "c", "score": 0.7}]
    result = rerank("query", chunks, top_k=2)
    assert len(result) == 2
    assert result[0]["score"] >= result[1]["score"]

def test_rerank_respects_top_k():
    chunks = [{"text": str(i), "score": float(i)/10} for i in range(10)]
    assert len(rerank("q", chunks, top_k=3)) == 3
