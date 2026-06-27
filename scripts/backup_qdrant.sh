#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
curl -X POST "http://localhost:6333/collections/hr_documents/snapshots"
echo "Qdrant snapshot triggered at $TIMESTAMP"
