#!/bin/bash
set -uo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
QDRANT_URL="${QDRANT_URL:-http://localhost:6333}"
ALL_OK=true

echo "=== HR PolicyIQ Health Check ==="
echo ""

# Backend liveness
if curl -sf "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo "Backend (liveness)  ✅ OK"
else
    echo "Backend (liveness)  ❌ DOWN — ${BACKEND_URL}/health unreachable"
    ALL_OK=false
fi

# Backend readiness (checks Postgres + Redis + Qdrant internally)
READY_RESPONSE=$(curl -sf "${BACKEND_URL}/health/ready" 2>/dev/null || echo '{"status":"unreachable"}')
READY_STATUS=$(echo "$READY_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "unknown")
if [ "$READY_STATUS" = "ready" ]; then
    echo "Backend (readiness) ✅ OK"
else
    echo "Backend (readiness) ❌ DEGRADED — $READY_RESPONSE"
    ALL_OK=false
fi

# Qdrant
if curl -sf "${QDRANT_URL}/healthz" > /dev/null 2>&1; then
    echo "Qdrant              ✅ OK"
else
    echo "Qdrant              ❌ DOWN — ${QDRANT_URL}/healthz unreachable"
    ALL_OK=false
fi

# Postgres (via Docker if available, else skip)
if command -v docker &> /dev/null; then
    POSTGRES_CONTAINER=$(docker ps -q -f name=postgres --format "{{.Names}}" 2>/dev/null | head -1)
    if [ -n "$POSTGRES_CONTAINER" ]; then
        if docker exec "$POSTGRES_CONTAINER" pg_isready -U hruser > /dev/null 2>&1; then
            echo "Postgres            ✅ OK"
        else
            echo "Postgres            ❌ NOT READY"
            ALL_OK=false
        fi
    else
        echo "Postgres            ⚠️  Container not found (skipped)"
    fi
fi

# Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli -u "${REDIS_URL:-redis://localhost:6379}" ping > /dev/null 2>&1; then
        echo "Redis               ✅ OK"
    else
        echo "Redis               ❌ DOWN"
        ALL_OK=false
    fi
else
    echo "Redis               ⚠️  redis-cli not found (skipped)"
fi

echo ""
if [ "$ALL_OK" = true ]; then
    echo "All services healthy"
    exit 0
else
    echo "One or more services are unhealthy"
    exit 1
fi
