# System Architecture

```
Client (Browser)
    │
    ▼
FastAPI (main.py)
    ├── /auth        → JWT auth, RBAC
    ├── /documents   → Upload → Parse → Chunk → Embed → Qdrant
    ├── /chat        → Query → ABAC Filter → Retrieve → Rerank → LLM → PII Filter
    ├── /leave       → CRUD + Workflow
    ├── /grievance   → CRUD + Workflow
    ├── /payroll     → Read-only per employee
    ├── /performance → Manager creates, employee views
    ├── /recruitment → Job postings + applications
    └── /admin       → Dashboard + Audit logs
    
Infrastructure:
    PostgreSQL  — structured HR data
    Qdrant      — vector embeddings with ABAC payload filters
    Redis       — rate limiting, Celery broker
    Ollama      — local LLM (prototype)
```
