# ADR 005: Modular Monolith over Microservices

**Status**: Accepted

## Decision
Ship as a single FastAPI application with internal module separation.

## Rationale
- Team size (2-5 engineers) doesn't justify microservices operational overhead
- FastAPI routers provide clean module boundaries
- Can be split into services later if needed (leave-service, rag-service, etc.)
- Single deployment, single DB, single Qdrant instance — simpler ops
