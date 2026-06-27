"""RAG evaluation service — computes RAGAS-style metrics."""
from typing import List, Dict

def compute_faithfulness(answer: str, chunks: List[Dict]) -> float:
    """Heuristic: check if answer words appear in context."""
    if not chunks or not answer:
        return 0.0
    context = " ".join(c.get("text", "") for c in chunks).lower()
    words = [w for w in answer.lower().split() if len(w) > 4]
    if not words:
        return 0.5
    hits = sum(1 for w in words if w in context)
    return round(hits / len(words), 3)

def compute_answer_relevance(query: str, answer: str) -> float:
    """Heuristic: keyword overlap between query and answer."""
    q_words = set(query.lower().split())
    a_words = set(answer.lower().split())
    overlap = q_words & a_words
    return round(len(overlap) / max(len(q_words), 1), 3)
