"""
Full RAG pipeline — PRD Section 10.
Steps: cache → transform → embed → hybrid search (ABAC) → RRF → confidence gate
       → rerank → PII pre-LLM → LLM → PII post-LLM → cache write → citations

FIX-01: query_transform is now applied BEFORE retrieval (was skipped — chat.py
         called run_rag_pipeline directly, bypassing chat_service.py transform).
FIX-02: confidence gate now uses should_abstain() helper instead of bare `if not chunks`.
FIX-03: citations built from citation.py format_citations() which uses normalised
         rerank_score, not raw RRF score.
FIX-04: prompt now includes page numbers via updated build_rag_prompt.
FIX-05: result dict includes 'confidence_label' for richer UI display.
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

    # --- Step 2: Query transformation (FIX-01: was missing from pipeline) ---
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

    # --- Step 4: Confidence gate (FIX-02: use should_abstain helper) ---
    from app.rag.confidence import compute_confidence, should_abstain, confidence_label
    confidence = compute_confidence(chunks)

    if should_abstain(chunks):
        result = {
            "answer": "I could not find a clear policy for this in the available HR documents. Please contact HR directly.",
            "citations": [],
            "confidence": confidence,
            "confidence_label": "low",
            "llm_called": False,
            "query": query,
        }
        return result

    # --- Step 5: Rerank ---
    try:
        from app.rag.reranker import rerank
        chunks = rerank(transformed_query, chunks, top_k=5)
    except Exception:
        chunks = chunks[:5]

    # --- Step 6: PII redaction pre-LLM ---
    from app.rag.pii_filter import filter_pii
    clean_chunks = []
    for c in chunks:
        c_copy = dict(c)
        c_copy["text"] = filter_pii(c["text"], use_presidio=False)
        clean_chunks.append(c_copy)

    # --- Step 7: LLM synthesis ---
    from app.rag.prompt_templates import HR_SYSTEM_PROMPT, build_rag_prompt
    prompt = build_rag_prompt(query, clean_chunks)
    llm_answer = await _call_llm(HR_SYSTEM_PROMPT, prompt)

    # --- Step 8: PII redaction post-LLM ---
    llm_answer = filter_pii(llm_answer, use_presidio=False)

    # --- Step 9: Build citations (FIX-03: use format_citations for normalised scores) ---
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

    # --- Step 10: Cache write (24h TTL) ---
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
            temperature=0.0,   # zero temperature — no creativity, pure retrieval
            max_tokens=400,    # citation engine needs < 200 words; cap headroom
        )
        return (completion.choices[0].message.content or "").strip()
    except Exception as e:
        logger.error("llm_call_failed", error=str(e))
        return "I was unable to generate a response at this time. Please try again later or contact HR."
