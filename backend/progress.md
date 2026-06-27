# HR Platform — Progress Log

**Last updated:** 2026-06-27  
**PRD version:** 2.0 Final  
**Stack:** FastAPI · PostgreSQL · Qdrant · Redis · Groq (Llama 3.1 8B) · BGE-small-en-v1.5 · React 18 + Vite + TypeScript

---

## Architecture Summary (read PRD for full detail)

- **Modular monolith** — one FastAPI codebase, 6 HR modules (policy, leave, payroll, recruitment, performance, grievance)
- **Hybrid RAG** — dense (bge-small) + sparse (TF hash) → RRF fusion → BGE reranker → Groq LLM
- **ABAC** — Qdrant filter runs inside DB; restricted chunks never enter application memory
- **PII** — Presidio + custom India patterns (Aadhaar, PAN, UAN) pre-LLM and post-LLM
- **Auth** — `X-User-Role` header (mock, no real JWT in dev); dependency in `dependencies.py` creates a mock User object
- **Embedding model in use:** `BAAI/bge-small-en-v1.5` (384-dim, CPU-only). NOT bge-m3 (that needs GPU + FlagEmbedding).

---

## Session 1 — 2026-06-27: Bug Audit + Full Fix Sprint

### What was done
Received the full zip (`hr-platform.zip`) plus the PRD PDF. Performed a complete read of all source files in the RAG pipeline, ingestion pipeline, API layer, config, and frontend. Identified 11 bugs across 10 files. All bugs fixed and fixed files delivered as output.

---

## Bug Register — Session 1

### BUG-A [CRITICAL] — Embedding dimension mismatch  
**File:** `backend/app/core/config.py`  
**Root cause:** `config.py` had hardcoded defaults `EMBEDDING_MODEL="BAAI/bge-m3"` and `EMBEDDING_DIM=1024`, but `.env` sets `EMBEDDING_MODEL=BAAI/bge-small-en-v1.5` and `EMBEDDING_DIM=384`. Qdrant collection is created using `settings.EMBEDDING_DIM`. If the collection was created at 1024-dim but actual embeddings are 384-dim, every upsert and search silently fails or crashes with a dimension mismatch error.  
**Fix:** Changed `config.py` defaults to `EMBEDDING_MODEL="BAAI/bge-small-en-v1.5"` and `EMBEDDING_DIM=384` to match `.env`. Added comment explaining that if you switch to bge-m3 you must update BOTH values together AND delete/recreate the Qdrant collection.  
**Status:** ✅ Fixed

---

### BUG-B [CRITICAL] — `groq` package missing from requirements.txt  
**File:** `backend/requirements.txt`  
**Root cause:** `pipeline.py` does `from groq import Groq` but `groq` was never added to `requirements.txt`. Any fresh `pip install -r requirements.txt` would not install groq, causing an `ImportError` at the first chat request.  
**Fix:** Added `groq==0.9.0` to requirements.txt.  
**Status:** ✅ Fixed

---

### BUG-C [CRITICAL] — Query transformation never called in pipeline  
**File:** `backend/app/rag/pipeline.py`  
**Root cause:** `chat.py` calls `run_rag_pipeline(query=req.query)` directly. `chat_service.py` calls `transform_query` first and then `run_rag_pipeline`, but `chat_service.py` is never imported or used anywhere — it's dead code. `pipeline.py` itself did not call `transform_query`. Result: all queries hit the vector DB as raw user text, losing synonym expansion and query cleaning.  
**Fix:** `pipeline.py` now calls `transform_query(query)` at Step 2, before retrieval. `chat_service.py` is now bypassed correctly (pipeline handles it internally).  
**Status:** ✅ Fixed

---

### BUG-D [CRITICAL] — Citations showed raw RRF score (~0.016) as match percentage  
**Files:** `backend/app/rag/citation.py`, `backend/app/rag/pipeline.py`  
**Root cause:** Old `pipeline.py` built citations with `"score": round(c["score"], 3)` where `c["score"]` is the RRF score. Max theoretical RRF score is `1/61 ≈ 0.0164`. The frontend displays `(score * 100).toFixed(0)%` so every citation showed "2% match" regardless of actual relevance.  
**Fix:**  
- `citation.py` `format_citations()` now uses `rerank_score` when available (set by `reranker.py`), normalised via sigmoid to [0,1].  
- Falls back to RRF score normalised against the theoretical max (1/61).  
- `pipeline.py` now calls `format_citations()` from `citation.py` instead of building citations inline.  
**Status:** ✅ Fixed

---

### BUG-E [CRITICAL] — Confidence gate only triggered on completely empty chunk list  
**Files:** `backend/app/rag/confidence.py`, `backend/app/rag/pipeline.py`  
**Root cause:** Old pipeline had `if not chunks: return abstain_result`. Non-empty but low-confidence results (e.g. one weakly matched chunk) still got sent to the LLM, producing hallucinated or unreliable answers.  
**Fix:**  
- `confidence.py` adds `should_abstain(chunks)` function with a configurable threshold (`CONFIDENCE_GATE_THRESHOLD = 0.25` on the normalised scale).  
- Also adds `confidence_label()` returning "high"/"medium"/"low" string for UI.  
- `pipeline.py` uses `should_abstain()` at the gate step.  
**Status:** ✅ Fixed

---

### BUG-F [CRITICAL] — Prompt template had no page number in source reference  
**File:** `backend/app/rag/prompt_templates.py`  
**Root cause:** Old `build_rag_prompt` used `[Source: {doc_title}, Chunk {chunk_index}]` — no page number. Even though `chunk["page"]` was populated by the PDF parser and stored in Qdrant, it never reached the LLM prompt. The LLM couldn't cite page numbers in its answers.  
**Fix:** `build_rag_prompt` now builds `[SOURCE N: {doc_title}, Page {page}]` (page omitted if not available). The LLM system prompt instructs it to cite by [SOURCE N] label with page. Instructions in prompt updated to demand page-level citation.  
**Status:** ✅ Fixed

---

### BUG-G — Indentation error in retriever.py  
**File:** `backend/app/rag/retriever.py`  
**Root cause:** The comment `# Dense search` was at column 0 (outside the function body's indentation level), followed by indented code. Python still ran it, but it was a clear edit error and signalled code had been incorrectly pasted.  
**Fix:** Fixed indentation; comment now at correct indentation level inside function body. Also removed unused `NamedVector` import (was imported but only `NamedSparseVector` was used).  
**Status:** ✅ Fixed

---

### BUG-H — `Citation.document_id` typed as `int` but Qdrant payload can return `None`  
**File:** `backend/app/schemas/chat.py`  
**Root cause:** If a chunk was indexed before the DB `Document` record was committed, or if test data was indexed manually, `document_id` in the Qdrant payload is `None`. The Pydantic `Citation` schema had `document_id: int` (non-optional), causing a serialization crash.  
**Fix:** Changed to `document_id: Optional[int] = None`. Also added `chunk_index: Optional[int] = None` and `confidence_label: str` to `ChatResponse` to match what `pipeline.py` now returns.  
**Status:** ✅ Fixed

---

### BUG-I — Citation dedup key collided across pages  
**File:** `backend/app/rag/citation.py`  
**Root cause:** `chunker.py` resets `chunk_index` to 0 for each new page. So chunk #0 on page 1 and chunk #0 on page 2 (from the same document) both produced dedup key `"{doc_id}_0"` and only one of them appeared in citations.  
**Fix:** Dedup key changed to `f"{doc_id}_{page}_{chunk_index}"` — uniquely identifies a chunk even across pages.  
**Status:** ✅ Fixed

---

### BUG-J — Unused import `SparseIndexParams` in qdrant_client.py  
**File:** `backend/app/db/qdrant_client.py`  
**Root cause:** `SparseIndexParams` was imported but never used. No runtime impact, but cleanup.  
**Fix:** Removed from import line.  
**Status:** ✅ Fixed

---

### BUG-K — `embed_sparse` tried `FlagEmbedding` on a `SentenceTransformer` object  
**File:** `backend/app/rag/embedder.py`  
**Root cause:** `embed_sparse` tried to do `from FlagEmbedding import BGEM3FlagModel` then called `.encode()` on `_model` which is a `SentenceTransformer` instance — wrong object type, guaranteed exception, always fell to the hash-based fallback. The dead branch added noise and false confidence that FlagEmbedding was active.  
**Fix:** Removed dead branch. The TF hash-based sparse fallback is now the single implementation, clearly documented. Added a comment showing the exact replacement code for when bge-m3 + FlagEmbedding is available.  
**Status:** ✅ Fixed

---

## Files Changed — Session 1

| File | Bugs Fixed |
|------|-----------|
| `backend/requirements.txt` | BUG-B |
| `backend/app/core/config.py` | BUG-A |
| `backend/app/db/qdrant_client.py` | BUG-J |
| `backend/app/rag/retriever.py` | BUG-G |
| `backend/app/rag/embedder.py` | BUG-K |
| `backend/app/rag/pipeline.py` | BUG-C, BUG-D, BUG-E, BUG-F |
| `backend/app/rag/prompt_templates.py` | BUG-F |
| `backend/app/rag/confidence.py` | BUG-E |
| `backend/app/rag/citation.py` | BUG-D, BUG-I |
| `backend/app/schemas/chat.py` | BUG-H |

---

## Files NOT Changed — Session 1 (verified clean)

- `backend/main.py` — correct; lifespan warms embedder, ensures Qdrant collection
- `backend/app/api/chat.py` — correct; calls `run_rag_pipeline` which now handles transform internally
- `backend/app/api/documents.py` — correct; upload → parse → chunk → index pipeline intact
- `backend/app/ingestion/parser.py` — correct; PDF page-by-page extraction with page numbers
- `backend/app/ingestion/chunker.py` — correct; word-window chunking, preserves page number per chunk
- `backend/app/ingestion/indexer.py` — correct; upserts with dense+sparse vectors, stores page in payload
- `backend/app/ingestion/metadata_tagger.py` — correct; keyword-based module detection
- `backend/app/rag/reranker.py` — correct; CrossEncoder with graceful fallback, sets `rerank_score`
- `backend/app/rag/pii_filter.py` — correct; India-specific Aadhaar/PAN/UAN patterns
- `backend/app/rag/query_transform.py` — correct; HR synonym expansion + clean
- `backend/app/core/dependencies.py` — correct for dev (mock user via X-User-Role header)
- `frontend/src/components/chat/CitationCard.tsx` — correct; shows `p.{page}` and score%
- `frontend/src/pages/ChatPage.tsx` — correct; shows confidence%, citation toggle
- `frontend/src/hooks/useChat.ts` — correct; destructures answer/citations/confidence from response
- `frontend/src/types/models.ts` — correct; Citation interface matches backend schema

---

## Known Remaining Limitations (not bugs — design trade-offs)

1. **Auth is mocked** — `dependencies.py` reads `X-User-Role` header and creates a fake `User(id=1)`. No real JWT verification in dev. For production: implement real JWT decode and DB user lookup.

2. **`chat_service.py` is dead code** — `services/chat_service.py` wraps `run_rag_pipeline` with transform but is never called. Pipeline now handles transform internally. `chat_service.py` can be deleted or kept as an alternative entry point.

3. **BGE reranker downloads on first request** — `reranker.py` downloads `BAAI/bge-reranker-large` (~1.3GB) on the first chat request. On cold start this adds 30-60s latency. Pre-download or cache the model. The reranker falls back gracefully if unavailable.

4. **chunk_index is per-page** — `chunker.py` resets `chunk_index` to 0 for each page. This is fixed in citation dedup (BUG-I) but means chunk_index alone is not a globally unique position identifier.

5. **No groq streaming** — `_call_llm` in `pipeline.py` uses blocking Groq call. SSE streaming endpoint exists in the codebase but `run_rag_pipeline` doesn't use it. Add streaming for better UX on long answers.

6. **Redis optional** — If Redis is down, pipeline falls back gracefully (no cache). Confirmed by try/except in pipeline.py Step 1.

7. **Qdrant collection dimension lock** — Once Qdrant collection is created with a given dimension (384), it cannot be changed without dropping and recreating the collection. Switching embedding models requires: stop server → drop collection → change EMBEDDING_MODEL + EMBEDDING_DIM in .env → restart → re-upload all documents.

---

## How to Run (dev)

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_lg   # for Presidio
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173
```

**Required services:** PostgreSQL on 5432, Qdrant on 6333, Redis on 6379.  
**Quick docker:** `docker-compose up -d postgres qdrant redis`

---

## Next Session — Suggested Tasks

- [ ] Add real JWT auth (decode token, look up User from DB)
- [ ] Stream Groq response via SSE (chat endpoint already has SSE route skeleton)
- [ ] Pre-download/cache BGE reranker model at startup to avoid cold-start delay
- [ ] Add `confidence_label` badge ("High / Medium / Low") to `CitationCard.tsx`
- [ ] Add RAGAS evaluation task (skeleton in `eval/run_ragas.py`)
- [ ] Test full upload → chunk → index → chat flow end-to-end with a real PDF
