#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_postgres_${TIMESTAMP}.sql"
docker exec $(docker ps -q -f name=postgres) pg_dump -U hruser hrplatform > $BACKUP_FILE
echo "Backup saved: $BACKUP_FILE"
