"""Unit tests for confidence scoring."""
from app.rag.confidence import (
    compute_confidence_from_rerank,
    compute_confidence_from_rrf,
    should_abstain,
    confidence_label,
)


def _chunk(rerank_score=None, rrf_score=0.02, page=1):
    c = {"score": rrf_score, "page": page, "text": "sample text", "document_id": 1, "document_title": "Doc"}
    if rerank_score is not None:
        c["rerank_score"] = rerank_score
    return c


# --- should_abstain ---

def test_abstain_on_empty():
    assert should_abstain([]) is True


def test_abstain_on_very_low_rrf():
    chunks = [_chunk(rrf_score=0.001)]
    assert should_abstain(chunks) is True


def test_no_abstain_on_decent_rrf():
    chunks = [_chunk(rrf_score=0.025)]
    assert should_abstain(chunks) is False


# --- compute_confidence_from_rrf ---

def test_rrf_empty():
    assert compute_confidence_from_rrf([]) == 0.0


def test_rrf_max_score():
    # Both lists rank=0 → score = 2/61, normalised against 2/61 → 1.0
    max_rrf = 2.0 / 61.0
    chunks = [_chunk(rrf_score=max_rrf)]
    assert compute_confidence_from_rrf(chunks) == 1.0


def test_rrf_partial_score():
    score = 1.0 / 61.0  # appears in one list only
    chunks = [_chunk(rrf_score=score)]
    result = compute_confidence_from_rrf(chunks)
    assert 0.4 < result < 0.6


# --- compute_confidence_from_rerank ---

def test_rerank_empty():
    assert compute_confidence_from_rerank([]) == 0.0


def test_rerank_high_score_answered():
    chunks = [
        _chunk(rerank_score=5.0, page=10),
        _chunk(rerank_score=4.0, page=10),
        _chunk(rerank_score=3.0, page=10),
        _chunk(rerank_score=2.0, page=10),
        _chunk(rerank_score=1.0, page=11),
    ]
    conf = compute_confidence_from_rerank(chunks, llm_answer="Policy states X. [SOURCE 1]")
    assert conf >= 0.75, f"Expected high confidence, got {conf}"


def test_rerank_abstained_answer_caps_confidence():
    chunks = [_chunk(rerank_score=0.5, page=1)]
    conf = compute_confidence_from_rerank(
        chunks,
        llm_answer="The available HR documents do not contain a clear answer.",
    )
    assert conf <= 0.45, f"Abstained answer should give low confidence, got {conf}"


def test_rerank_falls_back_to_rrf_when_no_rerank_score():
    chunks = [_chunk(rrf_score=0.025)]  # no rerank_score key
    conf = compute_confidence_from_rerank(chunks, llm_answer="Some answer.")
    assert 0.0 <= conf <= 1.0


def test_rerank_page_convergence_boosts_confidence():
    # 4 out of 5 chunks from same page → higher convergence bonus
    chunks_converged = [
        _chunk(rerank_score=0.1, page=5),
        _chunk(rerank_score=0.08, page=5),
        _chunk(rerank_score=0.06, page=5),
        _chunk(rerank_score=0.04, page=5),
        _chunk(rerank_score=0.02, page=9),
    ]
    chunks_scattered = [
        _chunk(rerank_score=0.1, page=1),
        _chunk(rerank_score=0.08, page=2),
        _chunk(rerank_score=0.06, page=3),
        _chunk(rerank_score=0.04, page=4),
        _chunk(rerank_score=0.02, page=5),
    ]
    answer = "Policy says X."
    conf_converged = compute_confidence_from_rerank(chunks_converged, llm_answer=answer)
    conf_scattered = compute_confidence_from_rerank(chunks_scattered, llm_answer=answer)
    assert conf_converged > conf_scattered, "Converged pages should give higher confidence"


# --- confidence_label ---

def test_label_high():
    assert confidence_label(0.80) == "high"

def test_label_medium():
    assert confidence_label(0.60) == "medium"

def test_label_low():
    assert confidence_label(0.30) == "low"

def test_label_boundary_high():
    assert confidence_label(0.75) == "high"

def test_label_boundary_medium():
    assert confidence_label(0.50) == "medium"
