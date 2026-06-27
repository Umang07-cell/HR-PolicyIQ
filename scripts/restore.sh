#!/bin/bash
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then echo "Usage: ./restore.sh <backup_file.sql>"; exit 1; fi
docker exec -i $(docker ps -q -f name=postgres) psql -U hruser hrplatform < $BACKUP_FILE
echo "Restore complete from $BACKUP_FILE"
