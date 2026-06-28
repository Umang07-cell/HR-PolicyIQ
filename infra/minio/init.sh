#!/bin/sh
set -e

mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

# Create buckets
mc mb --ignore-existing local/hr-documents
mc mb --ignore-existing local/hr-backups

# hr-documents: private — no public access (was incorrectly set to "download")
mc anonymous set none local/hr-documents

# hr-backups: private — no public access
mc anonymous set none local/hr-backups

echo "MinIO buckets initialised (both private)"
