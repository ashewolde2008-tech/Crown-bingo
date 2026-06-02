#!/bin/bash
# Firestore backup script
# Usage: ./scripts/backup-firestore.sh <project-id> <bucket>
# Example: ./scripts/backup-firestore.sh bingo-27d37 gs://crown-bingo-backups

PROJECT_ID=${1:-bingo-27d37}
BUCKET=${2:-gs://crown-bingo-backups}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "Starting Firestore backup..."
echo "Project: $PROJECT_ID"
echo "Destination: $BUCKET/$TIMESTAMP"

gcloud firestore export "$BUCKET/$TIMESTAMP" --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BUCKET/$TIMESTAMP"
else
  echo "Backup FAILED" >&2
  exit 1
fi
