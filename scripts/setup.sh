#!/bin/bash
set -euo pipefail

echo "=== HR PolicyIQ Setup ==="
cd "$(dirname "$0")/.."

# Check .env exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
        echo "IMPORTANT: Edit .env and set GROQ_API_KEY and SECRET_KEY before continuing."
        echo "  GROQ_API_KEY: get from https://console.groq.com"
        echo "  SECRET_KEY:   run: openssl rand -hex 32"
        exit 1
    else
        echo "ERROR: .env not found and no .env.example to copy from."
        exit 1
    fi
fi

# Validate required env vars
source .env 2>/dev/null || true
if [ -z "${GROQ_API_KEY:-}" ]; then
    echo "ERROR: GROQ_API_KEY is not set in .env"
    echo "  Get your free key at: https://console.groq.com"
    exit 1
fi
if [ -z "${SECRET_KEY:-}" ] || [ "${SECRET_KEY}" = "change-me-in-production-use-openssl-rand-hex-32" ]; then
    echo "ERROR: SECRET_KEY is not set or is using the default value."
    echo "  Generate one: openssl rand -hex 32"
    exit 1
fi

echo "1. Starting infrastructure..."
docker compose up postgres qdrant redis -d
echo "   Waiting for services to be healthy..."
sleep 8

echo "2. Installing Python dependencies..."
cd backend && pip install -r requirements.txt -q && cd ..

echo "3. Downloading spaCy model for Presidio..."
python -m spacy download en_core_web_lg -q

echo "4. Seeding database..."
python scripts/seed_dev_data.py

echo ""
echo "=== Setup complete ==="
echo ""
echo "Start the API:      cd backend && uvicorn main:app --reload --port 8000"
echo "Start the frontend: cd frontend && npm install && npm run dev"
echo ""
echo "Swagger docs:  http://localhost:8000/docs"
echo "Health check:  http://localhost:8000/health/ready"
echo "Frontend:      http://localhost:5173"
