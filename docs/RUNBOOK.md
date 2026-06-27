# Runbook

## Restart services
```bash
docker compose restart postgres qdrant redis
cd backend && uvicorn main:app --reload
```

## Re-seed database
```bash
python scripts/seed_db.py
```

## Ingest sample documents
```bash
python scripts/ingest_sample_docs.py
```

## Backup
```bash
./scripts/backup_postgres.sh
./scripts/backup_qdrant.sh
```

## Health check
```bash
./scripts/healthcheck.sh
```

## Common Issues
- **Port 5432 in use**: `docker compose down` then up again
- **Qdrant collection missing**: restart backend, it auto-creates on startup
- **Embedding slow on first run**: BGE-M3 downloads ~2GB on first load, wait it out
