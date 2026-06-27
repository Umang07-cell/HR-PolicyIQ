# HR Automation Platform — Backend Prototype

FastAPI backend with Swagger UI. 6 HR modules + RAG chat with ABAC security.

## Quick Start

### 1. Start infrastructure
```bash
docker compose up postgres qdrant redis -d
```

### 2. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env if needed
```

### 4. Seed test users
```bash
cd ..
python scripts/seed_db.py
```

### 5. Start API
```bash
cd backend
uvicorn main:app --reload
```

### 6. Open Swagger
http://localhost:8000/docs

## Test Credentials
| Email | Password | Role |
|---|---|---|
| employee@hr.com | employee123 | employee |
| manager@hr.com | manager123 | manager |
| hradmin@hr.com | admin123 | hr_admin |

## RAG Demo Flow
1. Login as `hradmin@hr.com` → copy token → Authorize in Swagger
2. `POST /documents/upload` — upload any PDF or DOCX (HR policy doc)
3. Login as `employee@hr.com` → Authorize
4. `POST /chat` — ask "How many casual leaves am I entitled to?"
5. See ABAC-filtered answer with citations

## LLM Setup (Ollama)
```bash
# Install Ollama: https://ollama.ai
ollama pull llama3.1:8b
ollama serve
```
Without Ollama, `/chat` returns the raw retrieved context (still demonstrates ABAC).

## Architecture
- **ABAC inside Qdrant** — role/dept/location filter runs before retrieval, not after
- **JWT claims** — role + department + location embedded at login
- **Append-only audit log** — every action logged, no deletes allowed
- **PII redaction** — Presidio + custom Aadhaar/PAN/UAN recognizers

## Modules
| Router | Prefix | Description |
|---|---|---|
| Auth | /auth | Login, register, profile |
| Documents | /documents | Upload, index, manage |
| Chat (RAG) | /chat | ABAC-filtered Q&A with citations |
| Leave | /leave | Requests, approvals |
| Grievance | /grievance | File, track, resolve |
| Performance | /performance | Reviews, ratings |
| Recruitment | /recruitment | Jobs, applications |
| Payroll | /payroll | Payslips (role-gated) |
| Admin | /admin | Dashboard, users, audit logs |
| Attestation | /attestation | Policy read confirmation |
