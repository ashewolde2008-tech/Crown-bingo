# Crown Bingo — Security Consolidation Design

**Date:** June 1, 2026
**Status:** Approved Design
**Priority:** Security First

---

## Overview

Consolidate Crown Bingo from 2 Firebase projects to 1, add a lightweight API layer for financial operations, implement tamper-proof audit logging, and fix critical security gaps — all within the Spark free tier.

---

## 1. Firebase Project Consolidation

### Current State
- Admin panel (`admin-panel`) uses project `bingo-27d37-5661f` for Firestore/Auth
- User app (`crownbingo`) and super agent app (`superagentcrownbingo`) use project `bingo-27d37`
- Admin panel creates Auth users in `bingo-27d37` via secondary Firebase app, requiring in-memory credential store (`authStore.js`) and re-auth after every creation

### Change
Move admin panel entirely to `bingo-27d37`.

### Files Modified

| File | Change |
|------|--------|
| `admin-panel/src/firebase.js` | Remove secondary `crownbingo` Firebase app; use single `initializeApp` with `bingo-27d37` config |
| `admin-panel/src/authStore.js` | **Delete** — no longer needed |
| `admin-panel/src/components/pages/UserManagement.js` | Replace `crownbingoAuth` references with primary `auth`; remove re-auth calls |
| `admin-panel/src/components/pages/AgentManagement.js` | Replace `crownbingoAuth` references with primary `auth`; remove re-auth calls |
| `admin-panel/setAdminClaim.js` | Target project changes to `bingo-27d37` |
| `admin-panel/admin.html` | Remove dual-project pattern; single Firebase config |

### Firestore Rules (bingo-27d37)
Single set of rules covering all collections. Admin API bypasses rules via Admin SDK. Client access restricted by role-based rules.

---

## 2. Lightweight API Layer

### Purpose
Server-side validation + transactional safety for money-moving operations + tamper-proof audit logs.

### Host
Render.com free tier (Node.js). Sleeps after inactivity; wakes on request — acceptable for admin/super-agent usage patterns.

### Operations Handled (4 total)

| Endpoint | Method | Access | Function |
|----------|--------|--------|----------|
| `/api/users` | POST | Super Admin, Super Agent | Create Firebase Auth user + Firestore doc |
| `/api/points/transfer` | POST | Super Admin, Super Agent | Transfer points with `runTransaction` + rollback |
| `/api/wallet/recharge` | POST | Super Admin, Super Agent | Recharge wallet + record transaction atomically |
| `/api/users/:uid/status` | PATCH | Super Admin, Super Agent | Disable/enable user with audit log |

### Architecture

```
Client (admin-panel / superagentcrownbingo)
    │
    ├── Reads ──► Firestore (direct, client SDK)
    │
    └── Financial writes ──► Node.js API (Render)
                                │
                                ├── Verify Firebase ID token (Admin SDK)
                                ├── Authorize by role (custom claims)
                                ├── Execute runTransaction
                                ├── Write auditLog document
                                └── Return { success, data/error }
```

### Auth Middleware
```javascript
// verifyToken.js
- Extract Bearer token from Authorization header
- Verify with admin.auth().verifyIdToken(token)
- Attach decoded claims to req.user
- Reject if missing/expired
```

### Route Files
- `routes/users.js` — create user (POST)
- `routes/points.js` — transfer points (POST)
- `routes/wallet.js` — recharge (POST)
- `routes/status.js` — enable/disable (PATCH)

### Transaction Safety (Point Transfer)
```
1. Start Firestore transaction
2. Read admin's points document
3. Read target user's points document
4. Validate: admin has sufficient points, percent > 0
5. Calculate: userReceives = (amount * 100) / percent
6. Write: admin.points -= userReceives
7. Write: target.points += userReceives
8. Write: history record
9. Commit
   ↳ Any failure → atomic rollback
10. Write audit log (post-commit)
```

### Client Updates
- `admin-panel/src/services/firebase.js` — add `apiPost(endpoint, data)` helper
- `UserManagement.js` — route user creation through API
- `AgentManagement.js` — route agent creation through API
- `superagentcrownbingo` DashboardTable + UserDetails — route point transfers through API instead of direct Firestore

---

## 3. Audit Logging

### Schema (`auditLogs` collection)
```javascript
{
  action:       String,   // POINTS_TRANSFERRED, USER_CREATED, USER_DISABLED, WALLET_RECHARGED
  actor:        { uid: String, email: String, role: String },
  target:       { uid: String, email: String },
  details:      { amount: Number, balanceBefore: Number, balanceAfter: Number },
  result:       "SUCCESS" | "FAILURE",
  error:        String | null,
  timestamp:    Timestamp,
  ip:           String,
  source:       "api" | "admin-panel" | "super-agent"
}
```

### Coverage Matrix

| Action | Written By | Server-Verified? |
|--------|-----------|-----------------|
| User created | API | ✅ |
| Points transferred | API | ✅ |
| Wallet recharged | API | ✅ |
| User disabled/enabled | API | ✅ |
| Agent created | Client (admin-panel) | ❌ |
| Settings changed | Client (admin-panel) | ❌ |
| Login events | Client (both panels) | ❌ |

Non-financial client-written logs are acceptable — they are informational, not authoritative.

### Audit Log Viewer
Minimal read-only view in admin panel Settings page. Table with date range filter, action type filter. No edits or deletes.

---

## 4. Other Security Fixes

### 4.1 2FA for Admin and Super Agent
- Firebase MFA requires Identity Platform (Blaze plan — verify billing compatibility)
- If on Spark: skip MFA for now; add a note in AGENTS.md to enable when upgrading
- If on Blaze: add MFA enrollment step to `AdminLogin.js` and `login.js` (super agent); check `user.multiFactor.enrolledFactors` on login; redirect to enrollment if none
- Low priority — only if billing allows

### 4.2 Logout (Super Agent App)
- Add logout button to dashboard sidebar in `Dashboard.js`
- Calls `signOut(auth)` + `localStorage.clear()` + redirect to `#/`
- Currently no way to end session

### 4.3 Standardize Point Transfer
- Remove the two-step (non-transactional) transfer in `EditDialog.js`
- All point transfers route through API `POST /api/points/transfer`
- Single code path: API server handles validation + transaction + rollback

### 4.4 Deduplicate Firebase Config (Super Agent)
- Extract Firebase config from `login.js`, `AddUserDialog.js`, `AddSubAgentDialog.js`, `settingPage.js`
- Create single `firebase.js` — import everywhere
- Reduces misconfiguration risk

### 4.5 Fix `Title` Import
- `Cards.js` imports `Title from '../../Title'` — no such file exists
- Remove import or define `Title` component inline

---

## 5. Files Not Modified

The following are intentionally left untouched:
- `crownbingo/` (user app) — no security changes needed; already uses single project
- `game logic` in all apps — unchanged
- `i18n` — unrelated
- `Netlify deployment config` — unchanged

---

## 6. Implementation Order

| Step | Dependency | Est. Effort |
|------|-----------|-------------|
| 1. API layer (Express + routes) | None | 3-4h |
| 2. Deploy API to Render | Step 1 | 30m |
| 3. Consolidate Firebase projects | Step 1 | 1h |
| 4. Add audit logging | Step 1 | 1h |
| 5. Quick fixes (logout, 2FA, dedup, Title) | None | 2h |
| 6. Target point transfers to API | Steps 1-4 | 1h |
| 7. Update admin panel to use API | Steps 1-3 | 1h |
| 8. Update super agent app to use API | Steps 1-4 | 1h |
| 9. Deploy everything | Steps 1-8 | 30m |
| 10. Verify end-to-end | Step 9 | 1h |
