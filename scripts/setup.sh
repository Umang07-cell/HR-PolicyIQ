#!/bin/bash
set -e
echo "=== HR Platform Setup ==="
cd "$(dirname "$0")/.."

echo "1. Starting infrastructure..."
docker compose up postgres qdrant redis -d
sleep 5

echo "2. Installing Python deps..."
cd backend && pip install -r requirements.txt && cd ..

echo "3. Seeding database..."
python scripts/seed_db.py

echo "4. Done! Start API with: cd backend && uvicorn main:app --reload"
echo "   Swagger: http://localhost:8000/docs"
