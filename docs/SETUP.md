# Setup Guide

## Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 20+ (for frontend)
- Ollama (for LLM)

## Quick Start

```bash
# 1. Start infra
docker compose up postgres qdrant redis -d

# 2. Install backend deps
cd backend && pip install -r requirements.txt && cd ..

# 3. Seed test users
python scripts/seed_db.py

# 4. Start API
cd backend && uvicorn main:app --reload

# 5. (Optional) Start frontend
cd frontend && npm install && npm run dev
```

## API: http://localhost:8000/docs
## Frontend: http://localhost:5173

## Test Credentials
| Email | Password | Role |
|---|---|---|
| employee@hr.com | employee123 | employee |
| manager@hr.com | manager123 | manager |
| hradmin@hr.com | admin123 | hr_admin |
