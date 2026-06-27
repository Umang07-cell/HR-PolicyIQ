#!/bin/bash
echo "Checking services..."
curl -sf http://localhost:8000/health && echo "✅ Backend OK" || echo "❌ Backend DOWN"
curl -sf http://localhost:6333/healthz && echo "✅ Qdrant OK" || echo "❌ Qdrant DOWN"
docker exec $(docker ps -q -f name=postgres) pg_isready -U hruser && echo "✅ Postgres OK" || echo "❌ Postgres DOWN"
redis-cli ping && echo "✅ Redis OK" || echo "❌ Redis DOWN"
