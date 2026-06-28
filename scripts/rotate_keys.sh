#!/bin/bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found. Run from the project root."
    exit 1
fi

NEW_KEY=$(openssl rand -hex 32)

echo "=== SECRET_KEY Rotation ==="
echo ""
echo "WARNING: All active JWT tokens will be invalidated."
echo "All logged-in users will be signed out immediately."
echo ""
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Back up .env before modifying
cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d_%H%M%S)"

# Replace or append SECRET_KEY
if grep -q "^SECRET_KEY=" "$ENV_FILE"; then
    sed -i "s|^SECRET_KEY=.*|SECRET_KEY=${NEW_KEY}|" "$ENV_FILE"
else
    echo "SECRET_KEY=${NEW_KEY}" >> "$ENV_FILE"
fi

echo "SECRET_KEY rotated in $ENV_FILE"

# Restart backend if running via Docker Compose
if command -v docker &> /dev/null && docker compose ps backend 2>/dev/null | grep -q "Up"; then
    echo "Restarting backend container..."
    docker compose restart backend
    echo "Backend restarted."
else
    echo ""
    echo "Restart the backend manually to apply the new key:"
    echo "  docker compose restart backend"
    echo "  OR: kill uvicorn and re-run"
fi

echo ""
echo "Key rotation complete."
