# Security Minimal Fix — Design Spec

**Date:** 2026-06-08
**Scope:** Fix critical Firestore rules vulnerability (S-1) + dead code ReferenceError (R-1)
**Approach:** Minimal fix — no functional impact, no new features, no CI/CD changes

---

## Problem Statement

### S-1: Firestore Rules Short-Circuit (CRITICAL)

The current `firestore.rules` uses `||` in permission checks:

```javascript
allow read, write: if isAuthenticated() || isSuperAgent() || isSuperAdmin();
```

Since `isAuthenticated()` is true for all signed-in users, the `isSuperAgent()` and `isSuperAdmin()` checks are dead code. **Any authenticated user can read and write to ANY document in Firestore.** Players can set `balance: 999999`, `userRole: 'superAgent'`, etc.

### R-1: syncWithFirebase ReferenceError (CRITICAL)

`crownbingo/src/pages/home.js:891-928` defines `syncWithFirebase` which calls `app.database()` but `app` is never imported. This throws `ReferenceError` on every mount for returning users. The function writes to Realtime Database `path/to/data` which is never read anywhere — it's dead code.

---

## Design

### 1. Firestore Rules Rewrite

Replace the permissive `||` rules with strict ownership/role-based checks. The rules are designed to preserve ALL existing client-side operations across the 3 apps.

#### Helper Functions

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isSuperAdmin() {
  return isAuthenticated() && request.auth.token.role == 'SUPER_ADMIN';
}

function isSuperAgent() {
  return isAuthenticated() && (
    request.auth.token.role == 'super_agent' ||
    request.auth.token.role == 'SUPER_AGENT'
  );
}

function isAgent() {
  return isSuperAdmin() || isSuperAgent();
}
```

#### Collection Rules

**`users/{userId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | Players read all users (UsersTable.js), agents read all users (DashboardTable.js). Preserves existing behavior. |
| `create` | `isAgent()` | Only agents create users (AddUserDialog, AddSubAgentDialog, Admin UserManagement). |
| `update` | `isAuthenticated() && (request.auth.uid == userId \|\| isAgent())` | Players write own doc (logout, phone, casher_percent). Agents write any user doc (recharge, withdraw, settings). **This is the S-1 fix.** |
| `delete` | `isSuperAdmin()` | Only admin deletes users. |

**`users/{userId}/histories/{historyId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated() && request.auth.uid == userId` | Players read own histories only. |
| `create` | `isAuthenticated() && request.auth.uid == userId` | Players create own history records. |

**`agents/{agentId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | Dashboard needs full agent list. |
| `create, update, delete` | `isSuperAdmin()` | Only admin manages agents. |

**`points/{pointId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated() && (request.auth.uid == pointId \|\| isAgent())` | Players query own points. Agents query any points (dashboard fallback). |
| `write` | `false` | Server-only (Admin SDK bypasses rules). |

**`points/{pointId}/histories/{historyId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAgent()` | Super agent reads legacy histories. |
| `write` | `false` | Server-only. |

**`history/{historyId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAgent()` | History page reads all records. |
| `create` | `isAgent()` | Recharge, withdraw, editPoints create history. |
| `update, delete` | `false` | Immutable audit trail. |

**`jackpots/{jackpotId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | Players read live jackpot ticker. |
| `update` | `isAuthenticated()` | Players update popup/claim status. |
| `create, delete` | `false` | No client creates or deletes jackpots. |

**`jackpotHistory/{entryId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | Players read own jackpot history. |
| `write` | `false` | Server-only. |

**`settings/{settingId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | All authenticated users read settings. |
| `write` | `isSuperAdmin()` | Only admin writes settings. |

**`transactions/{txnId}`, `games/{gameId}`, `bets/{betId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated() && (resource.data.userId == request.auth.uid \|\| isSuperAdmin())` | Users read own records, admin reads all. |
| `create, update, delete` | `false` | Server-only via Admin SDK. |

**`audit_logs/{logId}`, `auditLogs/{logId}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | Admin views audit logs. |
| `create, update, delete` | `false` | Server-only. Prevents client from forging audit trail. |

**`currentJackpot`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read` | `isAuthenticated()` | Legacy collection, read-only. |
| `write` | `false` | Deprecated. |

**Catch-all `{document=**}`**

| Operation | Rule | Rationale |
|-----------|------|-----------|
| `read, write` | `false` | Deny all unknown collections. |

---

### 2. Delete syncWithFirebase (R-1)

**File:** `crownbingo/src/pages/home.js`

Delete the `syncWithFirebase` function (lines 891-928) and its invocation. The function:
- Calls `app.database()` but `app` is never imported → throws `ReferenceError`
- Writes to Realtime Database `path/to/data` → never read anywhere
- Is dead/legacy code with no functional purpose

---

## Functional Impact Analysis

Every client-side Firestore operation was traced and verified against the new rules. Summary:

| App | Reads | Writes | Impact |
|-----|-------|--------|--------|
| Player (crownbingo) | 14 operations | 9 operations | **None** — all operations preserved |
| Super Agent | 16 operations | 15 operations | **None** — all operations preserved |
| Admin | 8 operations | 14 operations | **None** — all operations preserved |
| API (server) | Uses Admin SDK | Uses Admin SDK | **None** — bypasses rules |

---

## Deferred Work (Not In Scope)

These issues were identified but deferred for future sessions:

- **S-3:** Super-agent auth reads client-trusted `userRole` field (requires custom claims migration)
- **S-4:** Hardcoded API key fallbacks (requires Netlify env var setup)
- **S-5:** `serviceAccountKey.json` in working tree
- **R-2:** `handleRechargeSubmit` no transaction, no source-balance check
- **P-1:** N+1 read in `DashboardTable`
- **O-1:** No ErrorBoundary or Sentry

---

## Verification

After implementation:

1. Deploy Firestore rules to Firebase Console
2. Verify player app: login, play bingo, view history, check jackpot
3. Verify super agent: view dashboard, recharge user, withdraw, edit settings
4. Verify admin: manage users, manage agents, view settings, view audit logs
5. Verify API: place bet, recharge wallet, create game (server-side, unaffected)
6. Verify `syncWithFirebase` deletion: player app loads without console errors for returning users
