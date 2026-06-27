# ADR 002: Qdrant over pgvector

**Status**: Accepted

## Decision
Use Qdrant as the vector store instead of pgvector.

## Rationale
- Qdrant supports payload filtering natively — critical for ABAC inside the vector search
- pgvector has no equivalent to Qdrant's filter-during-search; you'd filter after retrieval, leaking restricted chunk IDs
- Qdrant HNSW index is purpose-built; pgvector uses IVFFlat which is slower at scale
