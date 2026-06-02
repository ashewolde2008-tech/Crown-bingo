# Crown Bingo Operations Runbook

## Health Checks
- `GET /health/live` — 200 if service is running
- `GET /health/ready` — 200 if Firestore is reachable
- `GET /health/metrics` — Prometheus metrics

## Common Incidents

### High Error Rate (>5%)
1. Check logs: `tail -f api/logs/crown-bingo-*.log`
2. Check /health/ready for Firestore status
3. Check Firebase status: https://status.firebase.google.com
4. If Firestore issue, circuit breaker should auto-degrade

### High Latency (p99 > 2s)
1. Check Firestore indexes: `firebase deploy --only firestore:indexes`
2. Check /health/metrics for db_query_duration_seconds
3. Look for N+1 queries in logs

### Auth Issues
1. Verify Firebase project is bingo-27d37 (not 5661f)
2. Check serviceAccountKey.json is current
3. Verify token claims include role field

## Rollback Procedure
1. Netlify: Site > Deploys > Rollback to previous
2. Render: Dashboard > Select deploy > Rollback
3. Git: `git revert HEAD && git push`

## Restart
```bash
# Render: Dashboard > Manual Deploy > Clear build cache & deploy
# Local: npm run dev from api/
```
