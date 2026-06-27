import hashlib
import json
from typing import Optional, AsyncGenerator
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

    from app.rag.query_transform import transform_query
    transformed_query = transform_query(query)

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

    try:
        from app.rag.reranker import rerank
        chunks = rerank(transformed_query, chunks, top_k=5)
    except Exception:
        chunks = chunks[:5]

    from app.rag.pii_filter import filter_pii
    clean_chunks = []
    for c in chunks:
        c_copy = dict(c)
        c_copy["text"] = filter_pii(c["text"], use_presidio=False)
        clean_chunks.append(c_copy)

    from app.rag.prompt_templates import HR_SYSTEM_PROMPT, build_rag_prompt
    prompt = build_rag_prompt(query, clean_chunks)
    llm_answer = await _call_llm(HR_SYSTEM_PROMPT, prompt)
    llm_answer = filter_pii(llm_answer, use_presidio=False)

    confidence = compute_confidence_from_rerank(clean_chunks, llm_answer=llm_answer)

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

    try:
        if redis and cache_key and not llm_answer.startswith("I was unable to generate"):
            redis.setex(cache_key, 86400, json.dumps(result))
    except Exception:
        pass

    return result


async def run_rag_pipeline_stream(
    query: str,
    role: str,
    department: Optional[str],
    location: Optional[str],
    module: Optional[str],
    user_id: int,
) -> AsyncGenerator[dict, None]:
    dept = department or ""
    loc = location or ""

    redis = None
    cache_key = None
    try:
        from app.db.redis_client import get_redis
        redis = get_redis()
        cache_key = _cache_key(query, role, dept, loc)
        cached = redis.get(cache_key)
        if cached:
            data = json.loads(cached)
            for char in data["answer"]:
                yield {"type": "token", "text": char}
            yield {
                "type": "done",
                "citations": data.get("citations", []),
                "confidence": data.get("confidence", 0.0),
                "confidence_label": data.get("confidence_label", "low"),
            }
            return
    except Exception:
        redis = None
        cache_key = None

    from app.rag.query_transform import transform_query
    transformed_query = transform_query(query)

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

    from app.rag.confidence import should_abstain, compute_confidence_from_rerank, confidence_label
    if should_abstain(chunks):
        yield {
            "type": "abstain",
            "text": "I could not find a clear policy for this in the available HR documents. Please contact HR directly.",
        }
        return

    try:
        from app.rag.reranker import rerank
        chunks = rerank(transformed_query, chunks, top_k=5)
    except Exception:
        chunks = chunks[:5]

    from app.rag.pii_filter import filter_pii
    clean_chunks = []
    for c in chunks:
        c_copy = dict(c)
        c_copy["text"] = filter_pii(c["text"], use_presidio=False)
        clean_chunks.append(c_copy)

    from app.rag.prompt_templates import HR_SYSTEM_PROMPT, build_rag_prompt
    prompt = build_rag_prompt(query, clean_chunks)

    full_answer = ""
    async for token in _call_llm_stream(HR_SYSTEM_PROMPT, prompt):
        clean_token = filter_pii(token, use_presidio=False)
        full_answer += clean_token
        yield {"type": "token", "text": clean_token}

    confidence = compute_confidence_from_rerank(clean_chunks, llm_answer=full_answer)

    from app.rag.citation import format_citations
    citations = format_citations(clean_chunks)

    label = confidence_label(confidence)

    try:
        if redis and cache_key and not full_answer.startswith("I was unable to generate"):
            redis.setex(cache_key, 86400, json.dumps({
                "answer": full_answer,
                "citations": citations,
                "confidence": confidence,
                "confidence_label": label,
                "llm_called": True,
                "query": query,
            }))
    except Exception:
        pass

    yield {
        "type": "done",
        "citations": citations,
        "confidence": confidence,
        "confidence_label": label,
    }


async def _call_llm(system_prompt: str, user_prompt: str) -> str:
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


async def _call_llm_stream(system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        stream = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.0,
            max_tokens=400,
            stream=True,
        )
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token
    except Exception as e:
        logger.error("llm_stream_failed", error=str(e))
        yield "I was unable to generate a response at this time. Please try again later or contact HR."