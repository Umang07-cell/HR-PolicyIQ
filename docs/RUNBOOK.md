# Runbook — HR PolicyIQ

## Daily Operations

### Start all services
```bash
docker compose up -d
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

### Health check
```bash
./scripts/healthcheck.sh
# Or via API:
curl http://localhost:8000/health/ready
```

### Re-seed database (dev only)
```bash
python scripts/seed_dev_data.py
```

### Ingest HR documents
```bash
python scripts/ingest_sample_docs.py
```

## Backups

### Postgres backup
```bash
./scripts/backup_postgres.sh
# Saves: backup_postgres_YYYYMMDD_HHMMSS.sql.gz
```

### Qdrant snapshot
```bash
./scripts/backup_qdrant.sh
# Downloads snapshot to: qdrant_snapshot_YYYYMMDD_HHMMSS.snapshot
```

## Common Incidents

### Backend not responding
```bash
# Check logs
docker logs hr-platform-backend-1 --tail 50
# Check readiness
curl http://localhost:8000/health/ready
# Restart
docker compose restart backend
```

### Qdrant collection missing
```bash
# Restart backend — it auto-creates the collection on startup
docker compose restart backend
```

### Redis out of memory
```bash
# Check memory usage
redis-cli info memory | grep used_memory_human
# Flush cache only (not sessions)
redis-cli --scan --pattern "rag:*" | xargs redis-cli del
```

### Celery workers not processing
```bash
# Check worker status
docker logs hr-platform-celery-worker-1 --tail 50
# Restart workers
docker compose restart celery-worker
```

### Rotate SECRET_KEY (invalidates all sessions)
```bash
./scripts/rotate_keys.sh
# Follow the prompts — updates .env and restarts backend
```

## Monitoring

- **Grafana**: http://localhost:3000 (admin / admin)
- **Prometheus**: http://localhost:9090
- **Key metrics**: `llm_request_duration_seconds`, `rag_abstain_total`, `cache_hit_total`

## Scaling

To add more Celery workers for parallel document ingestion:
```bash
docker compose up --scale celery-worker=4 -d
```

## Production Deployment

```bash
# Ensure .env.prod is populated
cp .env.example .env.prod
# Edit .env.prod with production values

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```
