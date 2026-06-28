# RAG Pipeline Flow — HR PolicyIQ

**Embedding model:** BGE-small-en-v1.5 (384-dim, CPU, ~130MB)
**Reranker:** BGE-reranker-large (CPU, ~1.3GB, cached at startup)
**LLM:** Llama 3.1 8B via Groq API (cloud inference, ~1-3s)

```
User Query (HTTP POST /chat/)
    │
    ▼
JWT Validation (Layer 1 auth — mocked in dev)
Role + department + location extracted
    │
    ▼
Redis Cache Check
SHA256(query + role + dept + location + module) → 24h TTL
    │  HIT → return cached answer in <1ms
    │  MISS ↓
    ▼
Query Transform
Synonym expansion (20 HR domain synonym groups)
Special char removal, whitespace normalisation
    │
    ▼
BGE-small-en-v1.5 Embedding
Single forward pass → 384-dim dense vector
Hash-based sparse vector (BM25-style) for keyword search
    │
    ▼
Qdrant Parallel Hybrid Search (ABAC enforced inside DB)
Dense HNSW search  +  Sparse BM25 search
ABAC filter: access_roles, access_departments, access_locations
Restricted chunks never leave Qdrant
    │
    ▼
RRF Fusion (Reciprocal Rank Fusion)
Merges dense + sparse ranked lists by rank position
Max 10 candidates
    │
    ▼
Confidence Gate (pre-rerank, early exit)
If RRF score < 0.20 threshold → abstain
"I could not find a clear policy — please contact HR"
    │  PASS ↓
    ▼
BGE-reranker-large (Cross-Encoder)
Scores each (query, chunk) pair jointly
Selects top-5 chunks by rerank_score
    │
    ▼
Final Confidence Calculation
confidence = 0.62 + 0.25×page_convergence + 0.10×score_spread
If LLM abstains → confidence capped at 42%
    │
    ▼
Presidio PII Redaction (Pre-LLM)
Aadhaar / PAN / UAN regex + Presidio NER
Chunk text sanitised before entering LLM context
    │
    ▼
Groq LLM — Llama 3.1 8B Instant
System prompt: citation-per-sentence enforcement
temperature=0.0, max_tokens=600
Streaming (SSE) or blocking call
    │
    ▼
Presidio PII Redaction (Post-LLM)
Final safety net on generated text
    │
    ▼
Citation Formatting
Relative score normalisation (top chunk = 100%)
Drop-off threshold: hide citations >25% below top score
    │
    ▼
Response + Citations + Confidence → User
Async: RAGAS faithfulness log, Redis cache write, Audit log
```
