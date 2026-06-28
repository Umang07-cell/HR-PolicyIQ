# Security Architecture — Five Layers

> **Note:** This document describes the intended production security architecture.
> The [STATUS] column reflects the current implementation state.
> See `progress.md` for sprint-by-sprint implementation history.
> **Do not share with compliance reviewers until Layer 1 and Layer 4 are fully active.**

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Authentication                    [STATUS: MOCKED] │
│                                                              │
│  Intended: JWT token (HS256) containing role, department,   │
│  and location claims. 60-minute expiry. Issued at /auth/    │
│  login after bcrypt password verification.                   │
│                                                              │
│  Current: X-User-Role header accepted without verification. │
│  /auth/login endpoint implemented but JWT not yet enforced  │
│  in get_current_user(). Sprint 2 item.                      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: RBAC (FastAPI route guards)       [STATUS: ACTIVE] │
│                                                              │
│  require_role("hr_admin") enforced on sensitive endpoints.  │
│  get_current_user() called on all protected routes.         │
│  Works correctly — role is read from mock user object.      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: ABAC (Qdrant payload filters)   [STATUS: PARTIAL] │
│                                                              │
│  Intended: filter by role, department, and location.        │
│  Current: role and location filters active. Department      │
│  filter added in backend audit Sprint 1. Verify deployed.  │
│  Restricted chunks never leave the Qdrant database.         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: PII Redaction (Presidio)          [STATUS: ACTIVE] │
│                                                              │
│  use_presidio=True enabled in pipeline.py (Sprint 1 fix).  │
│  Custom recognisers for Aadhaar, PAN, UAN registered at    │
│  startup via presidio/engine.py singleton.                  │
│  Runs on chunks before LLM and on LLM output before user.  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: Audit Log                         [STATUS: ACTIVE] │
│                                                              │
│  Every action logged to audit_logs table.                   │
│  DB-level triggers prevent DELETE and UPDATE (append-only). │
│  Triggers applied via infra/postgres/audit_triggers.sql     │
│  mounted as Postgres init script in docker-compose.yml.     │
└─────────────────────────────────────────────────────────────┘
```

## PostgreSQL Row-Level Security

RLS policies are defined in `infra/postgres/rls_policies.sql` and applied at DB init.

| Table | Policy | Bypass roles |
|---|---|---|
| `leave_requests` | `employee_id = app.user_id` | hr_admin, manager, executive |
| `payroll_records` | `employee_id = app.user_id` | hr_admin, executive |

**Status:** RLS is enabled at the DB level. Application-level session variables
(`SET LOCAL app.user_id`) must be wired in via SQLAlchemy event listener — Sprint 2 item.
