# Crown Bingo — Production Hardening Implementation Plan

**Date**: June 2, 2026
**Status**: Design approved — ready for implementation planning
**System Score (current)**: 2.5/10
**Target Score**: 8.5/10

---

## Architecture (Current)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Player App  │  │  Super Agent │  │  Admin Panel │
│  (pre-built) │  │  (pre-built) │  │  (React 18)  │
│  proj: 5661f │  │  proj: 27d37 │  │  proj: 27d37  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Firebase   │
                  │  Spark plan │
                  │  No backend │
                  └─────────────┘
```

**Critical problems**:
1. No backend API — all apps talk directly to Firestore from browser
2. Split Firebase projects — admin (27d37) and player (5661f) are siloed
3. Spark plan — no Cloud Functions, no background workers
4. All 15 identified issues stem from missing server-side enforcement

---

## Architecture (Target)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Player App  │  │  Super Agent │  │  Admin Panel │
│  crownbingo/ │  │  superagent./│  │  admin-panel/│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │ Bearer token    │ Bearer token    │ Bearer token
       ▼                 ▼                 ▼
┌──────────────────────────────────────────────────┐
│  Express API (Render free / Netlify Functions)    │
│  Middleware stack (ordered):                      │
│  1. cors.js          — origin whitelist per env   │
│  2. rateLimit.js     — in-memory express-rate-limit│
│  3. correlationId.js — UUID per request           │
│  4. auth.js          — verify Firebase token      │
│  5. rbac.js          — verify role from DB        │
│  6. validate.js      — Joi schema per endpoint    │
│  7. retry.js         — 3 attempts, backoff        │
│  8. circuitBreaker.js— 5 fails → OPEN → cache     │
│  9. errorHandler.js  — structured JSON + log      │
├──────────────────────────────────────────────────┤
│  Routes: /users /agents /transactions /bets       │
│          /settings /audit-logs /health             │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
                ┌──────────────┐
                │  Firebase    │
                │  (consolidated to bingo-27d37) │
                │  Enhanced rules + atomic txs   │
                └──────────────┘
```

---

## Issues Addressed

### 5 CRITICAL
| ID | Issue | Fix | Phase |
|----|-------|-----|-------|
| CR-001 | Hardcoded API keys | Move to env vars, rotate keys, purge git | 1 |
| CR-002 | No transaction atomicity | runTransaction() on all financial ops | 1 |
| CR-003 | No RBAC enforcement | Server-side verify role from DB per request | 1 |
| CR-004 | No input validation | Joi schemas on every endpoint | 1 |
| CR-005 | Single points of failure | Circuit breaker + cached fallback | 2 |

### 5 HIGH
| ID | Issue | Fix | Phase |
|----|-------|-----|-------|
| HR-001 | No rate limiting | express-rate-limit global + per-user | 1 |
| HR-002 | No retry logic | Exponential backoff wrapper | 2 |
| HR-003 | No audit logging | Winston structured logging + immutable logs | 3 |
| HR-004 | No monitoring | Prometheus metrics endpoint | 3 |
| HR-005 | No Firestore indexes | Composite indexes for common queries | 2 |

### 5 MEDIUM
| ID | Issue | Fix | Phase |
|----|-------|-----|-------|
| MR-001 | No backup strategy | Daily Firestore export via gcloud CLI | 3 |
| MR-002 | No data isolation | Firestore rule audit + test suite | 2 |
| MR-003 | No DR plan | Documented RTO/RPO procedures | 3 |
| MR-004 | No load testing | k6 script targeting /health endpoints | 3 |
| MR-005 | No CI/CD | GitHub Actions deploy to Render | 3 |

---

## Phase Breakdown

### Phase 1: Security Gateway (Week 1) — 0→4/10

Build the Express API. Every endpoint gets auth, RBAC, validation, rate limiting, CORS, correlation ID, and transaction atomicity.

**Files to create**:
```
api/
├── server.js
├── package.json
├── .env.example
├── middleware/
│   ├── auth.js
│   ├── rbac.js
│   ├── validate.js
│   ├── rateLimit.js
│   ├── cors.js
│   ├── correlationId.js
│   ├── errorHandler.js
│   └── retry.js
├── routes/
│   ├── users.js
│   ├── agents.js
│   ├── transactions.js
│   ├── bets.js
│   ├── settings.js
│   ├── auditLogs.js
│   └── health.js
├── services/
│   ├── firebase.js
│   └── cache.js
├── validation/
│   └── schemas.js
├── logger.js
└── metrics.js
```

**Files to modify**:
```
admin-panel/src/firebase.js        # Remove hardcoded keys → env vars
admin-panel/src/components/pages/  # Route all Firestore calls through API
crownbingo/static/js/firebase.js   # Same
crownbingo/static/js/App.js        # Route through API
superagentcrownbingo/...           # Same pattern
.firebase.studio/...               # Update
```

**Zero-cost stack**:
- Express + express-rate-limit (in-memory)
- node-cache (in-memory caching)
- winston + winston-daily-rotate-file
- prom-client (exposes /metrics)
- Joi (validation)
- Render free web service OR Netlify Functions

### Phase 2: Resilience (Week 2) — 4→6/10

Circuit breaker, retry enhancement, offline support, service worker, Firestore index deployment.

**Key additions**:
```
api/services/circuitBreaker.js     # CLOSED→OPEN→HALF_OPEN state machine
admin-panel/public/service-worker.js
crownbingo/service-worker.js
firestore.indexes.json             # Enhanced composite indexes
```

### Phase 3: Observability + Ops (Week 3) — 6→8.5/10

Structured logging, metrics endpoint, error tracking, backup automation, CI/CD, DR docs.

**Key additions**:
```
api/logger.js                      # Winston daily rotate
api/metrics.js                     # prom-client histograms/gauges
.github/workflows/deploy.yml       # Render deploy
.github/workflows/backup.yml       # Firestore export
docs/ops/runbook.md                # Incident response
docs/ops/disaster-recovery.md      # RTO/RPO + procedures
```

---

## Dependencies

| Package | Purpose | License | Free? |
|---------|---------|---------|-------|
| express | HTTP framework | MIT | Yes |
| firebase-admin | Server-side Firebase | Apache-2.0 | Yes |
| joi | Input validation | BSD-3-Clause | Yes |
| express-rate-limit | Rate limiting | MIT | Yes |
| node-cache | In-memory cache | MIT | Yes |
| winston | Structured logging | MIT | Yes |
| winston-daily-rotate-file | Log rotation | MIT | Yes |
| prom-client | Metrics | Apache-2.0 | Yes |
| uuid | Correlation IDs | MIT | Yes |

Zero licensing costs. Zero usage restrictions.

---

## Success Criteria

By end of Phase 3:
- [ ] Zero hardcoded credentials in source
- [ ] 100% API endpoints behind auth + RBAC + validation
- [ ] Rate limiting active (<5 failed logins/15min)
- [ ] All financial ops in Firestore transactions
- [ ] Circuit breaker prevents cascading failures
- [ ] Health checks (liveness + readiness) operational
- [ ] Structured logging with correlation IDs
- [ ] Prometheus /metrics endpoint collecting data
- [ ] Automated daily backups running
- [ ] CI/CD pipeline deploys on git push
- [ ] Disaster recovery document signed off
- [ ] Overall score: 8.5/10
