# Crown Bingo Disaster Recovery Plan

## RTO/RPO
- RTO: 4 hours
- RPO: 1 hour

## Scenarios

### Firebase Project Unavailable
1. Verify: https://status.firebase.google.com
2. Switch DNS to backup deploy (Netlify branch deploy)
3. Redeploy with backup Firebase project config
4. Restore from backup: `gcloud firestore import gs://crown-bingo-backups/PATH`

### Database Corruption
1. Identify corrupted collections from audit logs
2. Restore to temp collection: `gcloud firestore import --collection-ids=users gs://crown-bingo-backups/PATH`
3. Verify data integrity
4. Atomic swap: rename collections

### Deployment Failure
1. Detect via /health/ready failure
2. Rollback: Git revert + redeploy
3. Notify team

## Automation
- Backups: Daily at 2 AM UTC, retention 30 days
- Health checks: Every 5 seconds (Render)
- Rollback: Manual via Netlify/Render UI
