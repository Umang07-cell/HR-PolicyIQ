"""
Full RAG pipeline — PRD Section 10.
Steps: cache → transform → embed → hybrid search (ABAC) → RRF → confidence gate
       → rerank → confidence (rerank-based) → PII pre-LLM → LLM → PII post-LLM
       → cache write → citations

FIX-01: query_transform applied before retrieval.
FIX-02: confidence gate uses should_abstain() with corrected RRF normalisation.
FIX-03: citations use normalised rerank_score.
FIX-04: prompt includes page numbers.
FIX-05: result dict includes confidence_label.
FIX-06: confidence computed AFTER reranking from sigmoid(rerank_score),
         not before reranking from raw RRF. This is the 100% confidence bug fix.
"""
import hashlib
import json
from typing import Optional
from app.core.config import settings
from app.core.logging import logger


def _cache_key(query: str, role: str, dept: str, loc: str) -> str:
    raw = f"{query.lower().strip()}|{role}|{dept}|{loc}"
    return f"rag:{hashlib.sha256(raw.encode()).hexdigest()}"


async def run_rag_pipeline(
    query: str,
    role: str,
    department: Optional[str],
    location: Optional[str],
    module: Optional[str],
    user_id: int,
) -> dict:
    dept = department or ""
    loc = location or ""

    # --- Step 1: Redis cache check ---
    redis = None
    cache_key = None
    try:
        from app.db.redis_client import get_redis
        redis = get_redis()
        cache_key = _cache_key(query, role, dept, loc)
        cached = redis.get(cache_key)
        if cached:
            logger.info("cache_hit", user_id=user_id, key=cache_key[:16])
            return json.loads(cached)
    except Exception:
        redis = None
        cache_key = None

    # --- Step 2: Query transformation ---
    from app.rag.query_transform import transform_query
    transformed_query = transform_query(query)
    logger.info("query_transformed", original=query[:80], transformed=transformed_query[:80])

    # --- Step 3: Hybrid retrieval with ABAC ---
    try:
        from app.rag.retriever import retrieve_chunks
        chunks = retrieve_chunks(
            query=transformed_query,
            role=role,
            department=dept,
            location=loc,
            module=module,
            top_k=10,
        )
    except Exception as e:
        logger.error("retrieval_failed", error=str(e))
        chunks = []

    # --- Step 4: Confidence gate (early exit, RRF-based, before reranker) ---
    # FIX-06: this gate uses RRF only for cheap early exit.
    # Final user-facing confidence is computed after reranking at Step 6.
    from app.rag.confidence import should_abstain, compute_confidence_from_rerank, confidence_label
    if should_abstain(chunks):
        return {
            "answer": "I could not find a clear policy for this in the available HR documents. Please contact HR directly.",
            "citations": [],
            "confidence": 0.0,
            "confidence_label": "low",
            "llm_called": False,
            "query": query,
        }

    # --- Step 5: Rerank ---
    try:
        from app.rag.reranker import rerank
        chunks = rerank(transformed_query, chunks, top_k=5)
    except Exception:
        chunks = chunks[:5]

    # --- Step 6: Compute final confidence from rerank scores (FIX-06) ---
    # sigmoid(rerank_score) is a real relevance probability, not a ranking artefact.
    # This replaces the broken RRF-based confidence that always showed 100%.
    confidence = compute_confidence_from_rerank(chunks)
    logger.info("confidence_computed", score=confidence, method="rerank" if "rerank_score" in chunks[0] else "rrf_fallback")

    # --- Step 7: PII redaction pre-LLM ---
    from app.rag.pii_filter import filter_pii
    clean_chunks = []
    for c in chunks:
        c_copy = dict(c)
        c_copy["text"] = filter_pii(c["text"], use_presidio=False)
        clean_chunks.append(c_copy)

    # --- Step 8: LLM synthesis ---
    from app.rag.prompt_templates import HR_SYSTEM_PROMPT, build_rag_prompt
    prompt = build_rag_prompt(query, clean_chunks)
    llm_answer = await _call_llm(HR_SYSTEM_PROMPT, prompt)

    # --- Step 9: PII redaction post-LLM ---
    llm_answer = filter_pii(llm_answer, use_presidio=False)

    # --- Step 10: Build citations ---
    from app.rag.citation import format_citations
    citations = format_citations(clean_chunks)

    result = {
        "answer": llm_answer,
        "citations": citations,
        "confidence": confidence,
        "confidence_label": confidence_label(confidence),
        "llm_called": True,
        "query": query,
    }

    # --- Step 11: Cache write (24h TTL) ---
    try:
        if redis and cache_key and not llm_answer.startswith("I was unable to generate"):
            redis.setex(cache_key, 86400, json.dumps(result))
    except Exception:
        pass

    return result


async def _call_llm(system_prompt: str, user_prompt: str) -> str:
    """Call Groq API for LLM inference."""
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.0,
            max_tokens=400,
        )
        return (completion.choices[0].message.content or "").strip()
    except Exception as e:
        logger.error("llm_call_failed", error=str(e))
        return "I was unable to generate a response at this time. Please try again later or contact HR."
