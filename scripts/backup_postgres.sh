#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_FILE="${BACKUP_DIR}/postgres_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

CONTAINER=$(docker ps -q -f name=postgres --format "{{.Names}}" | head -1)
if [ -z "$CONTAINER" ]; then
    echo "ERROR: No running postgres container found."
    exit 1
fi

echo "Backing up from container: $CONTAINER"
docker exec "$CONTAINER" pg_dump -U hruser hrplatform | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "Backup saved: $BACKUP_FILE ($SIZE)"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "postgres_*.sql.gz" -mtime +30 -delete
echo "Old backups pruned (>30 days)"
