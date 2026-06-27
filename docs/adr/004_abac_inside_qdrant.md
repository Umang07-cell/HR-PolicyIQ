# ADR 004: ABAC Filter Inside Qdrant

**Status**: Accepted

## Decision
Apply role/department/location access filters as Qdrant payload filters, not as post-retrieval Python filters.

## Rationale
- Post-retrieval filtering leaks restricted chunk IDs to the application layer
- Qdrant payload filters run before ANN search — zero exposure of restricted chunks
- Single source of truth for access control
