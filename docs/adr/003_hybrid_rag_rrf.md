# ADR 003: Hybrid RAG with RRF

**Status**: Proposed (not yet implemented in prototype)

## Decision
Combine dense (BGE-M3) and sparse (BM25) retrieval with Reciprocal Rank Fusion.

## Rationale
- Dense-only misses exact keyword matches (employee IDs, policy codes)
- Sparse-only misses semantic similarity
- RRF is simple to implement and outperforms weighted sum in practice
