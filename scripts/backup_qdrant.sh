#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
QDRANT_URL="${QDRANT_URL:-http://localhost:6333}"
COLLECTION="${QDRANT_COLLECTION:-hr_documents}"
SNAPSHOT_FILE="${BACKUP_DIR}/qdrant_${COLLECTION}_${TIMESTAMP}.snapshot"

mkdir -p "$BACKUP_DIR"

echo "Triggering Qdrant snapshot for collection: $COLLECTION"
RESPONSE=$(curl -sf -X POST "${QDRANT_URL}/collections/${COLLECTION}/snapshots")
SNAPSHOT_NAME=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['name'])" 2>/dev/null || echo "")

if [ -z "$SNAPSHOT_NAME" ]; then
    echo "ERROR: Failed to create snapshot. Response: $RESPONSE"
    exit 1
fi

echo "Snapshot created: $SNAPSHOT_NAME"
echo "Downloading snapshot..."

curl -sf "${QDRANT_URL}/collections/${COLLECTION}/snapshots/${SNAPSHOT_NAME}" \
    -o "$SNAPSHOT_FILE"

SIZE=$(du -sh "$SNAPSHOT_FILE" | cut -f1)
echo "Snapshot saved: $SNAPSHOT_FILE ($SIZE)"

# Prune local snapshots older than 7 days
find "$BACKUP_DIR" -name "qdrant_*.snapshot" -mtime +7 -delete
echo "Old snapshots pruned (>7 days)"
