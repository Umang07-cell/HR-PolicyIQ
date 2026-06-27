# RAG Pipeline Flow

```
User Query
    │
    ▼
Query Transform (expand synonyms, clean)
    │
    ▼
BGE-M3 Embed Query → [1024-dim vector]
    │
    ▼
Qdrant Search + ABAC Filter
(role/dept/location filter runs INSIDE Qdrant)
    │
    ▼
Top-10 Chunks Retrieved
    │
    ▼
BGE Reranker → Top-5 Chunks
    │
    ▼
Confidence Check (< 0.3 → fallback response)
    │
    ▼
PII Redaction on Chunks
    │
    ▼
LLM Prompt (Ollama / vLLM)
    │
    ▼
LLM Response
    │
    ▼
PII Redaction on Output
    │
    ▼
Response + Citations → User
```
