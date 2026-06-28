# Setup Guide — HR PolicyIQ

## Prerequisites
- Docker Desktop 4.x+
- Python 3.11+
- Node.js 20+ (frontend only)
- A free [Groq API key](https://console.groq.com) — no GPU required

## Quick Start (Development)

```bash
# 1. Copy environment template
cp .env.example .env
# Edit .env and set: GROQ_API_KEY=gsk_...  SECRET_KEY=$(openssl rand -hex 32)

# 2. Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# 3. Install backend dependencies
cd backend && pip install -r requirements.txt

# 4. Download spaCy model for Presidio PII detection
python -m spacy download en_core_web_lg

# 5. Seed test users
cd .. && python scripts/seed_dev_data.py

# 6. Start API
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 7. Start frontend (optional)
cd ../frontend && npm install && npm run dev
```

## Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `GROQ_API_KEY` | Groq API key for LLM inference | `gsk_abc123...` |
| `SECRET_KEY` | JWT signing secret (32+ hex chars) | `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://hruser:hrpass@localhost:5432/hrplatform` |
| `QDRANT_HOST` | Qdrant hostname | `localhost` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |

## Service URLs

| Service | URL |
|---|---|
| API (Swagger) | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
| Liveness | http://localhost:8000/health |
| Readiness | http://localhost:8000/health/ready |

## Test Credentials (after seed)

| Email | Password | Role |
|---|---|---|
| employee@hr.com | employee123 | employee |
| manager@hr.com | manager123 | manager |
| hradmin@hr.com | admin123 | hr_admin |
| exec@hr.com | exec123 | executive |

## Running Tests

```bash
pip install pytest pytest-asyncio httpx
cd tests && pytest -v
```

## Ingest Sample Documents

```bash
# Backend must be running and users must be seeded first
python scripts/ingest_sample_docs.py
```

## Common Issues

| Problem | Fix |
|---|---|
| `GROQ_API_KEY` errors | Add key to `.env`, restart backend |
| Port 5432 in use | `docker compose down && docker compose up -d` |
| Qdrant collection missing | Restart backend — auto-creates on startup |
| `en_core_web_lg` not found | `python -m spacy download en_core_web_lg` |
| Slow first chat response | BGE reranker (~1.3 GB) downloads on first use; pre-warmed after that |
BGE-small downloads ~130MB on first load
