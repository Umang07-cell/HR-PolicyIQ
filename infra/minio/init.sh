#!/bin/sh
mc alias set local http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
mc mb --ignore-existing local/hr-documents
mc mb --ignore-existing local/hr-backups
mc policy set download local/hr-documents
