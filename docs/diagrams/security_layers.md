# Security Layers

```
Layer 1: JWT Authentication
  - Token contains role + department + location claims
  - 8-hour expiry
  - HS256 signed with SECRET_KEY

Layer 2: RBAC (FastAPI Depends)
  - require_role("hr_admin") on sensitive endpoints
  - get_current_user() on all protected routes

Layer 3: ABAC (Qdrant payload filters)
  - Vector search filtered by access_roles, access_departments
  - Restricted chunks never retrieved

Layer 4: PII Redaction (Presidio)
  - Runs on chunks before LLM
  - Runs on LLM output before response

Layer 5: Audit Log
  - Every action logged to append-only table
  - No DELETE/UPDATE allowed via DB trigger
```
