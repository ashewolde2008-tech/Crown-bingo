# Crown Bingo — Session Handoff

**Date:** 2026-06-07

## Summary
This session delivered three features, one cleanup, and a full architecture audit. All changes are live in production. No code is committed — review diffs in `git status` before committing.

---

## Features delivered (live in production)

### 1. Player app (crownbingo) — `main.1ed5b32c.js` — https://crown-bingo.pages.dev/?cb=17
- Admin-style login page (kept from prior rebuild)
- Green pulse animation on **Bet Amount** and **Select Cartela** labels on `CreateNewGame.js`
- BINGO labels (B/I/N/G/O) passed from `home.js` via `customBingoText.js`
- NewGame bg `#1E1E24` with hamburger top-left
- Top bar uses `BoorioPoker` (react-slick) with banners 24–31
- Deleted unused `banner.js` / `SlidableImageComponent`
- Fixed `banner31.jpg` (not .png)

### 2. Super Agent — `main.38644612.js` — https://crown-bingo-super-agent.pages.dev/?cb=13
**Wallet Recharge option** added to Edit Settings dialog (atomic runTransaction: agent -X, user +X, pre-check agent balance, write history record).

**Dashboard fixes:**
- Wallet column shows actual `users/{uid}.balance` (with legacy `points` fallback, then 0)
- "User details" column removed
- AppBar merged with welcome banner (single 96px-tall toolbar with crown logo + title + welcome text + date)
- HistoryChart removed from dashboard

**History page fixes:**
- "Filtered Total House Wallet Awarded" now sums actual `pointsAdded` (not bogus `pointsAdded*100/percent`)
- Default date range widened to last 30 days
- History writes added to all balance-changing actions: `EditDialog.handleSaveClick` (`editPoints`), `DashboardTable.handleRecharge` (`recharge`), `DashboardTable.handleWithdraw` (`withdraw`)

### 3. Admin — `main.6f91897e.js` — https://crown-bingo-admin.pages.dev/?cb=11
**Settings column → Wallet Withdraw toggle** in Agent Management:
- New agents default to `walletWithdrawEnabled: false` (written to both `users/{uid}` and `agents/{uid}`)
- Settings dialog has a Switch with "Allow this agent to withdraw from user wallets into their own agent wallet" helper text
- Persisted on Save to both collections

**Super agent guard:** `handleWithdraw` in `DashboardTable.js` reads `walletWithdrawEnabled` inside the transaction; if not `true`, aborts with: *"Wallet Withdraw is disabled for your account. Ask the admin to enable it in Agent Management → Settings."*

---

## Cleanup completed
- Deleted: `-w` (1MB junk), `SESSION.md` (old), `scratch/` (3 log files), `.netlify/` (replaced by CF Pages), `.wrangler/tmp/` in admin+superagent (empty)
- Deleted old build artifacts: `crownbingo/static/js/*` (10 files), `crownbingo/static/css/*` and `static/css/pages/*` (8 files), `superagentcrownbingo/static/*` (35 files)
- Deleted dead code: `admin-panel/src/services/api.js` (never imported) and empty parent `services/` dir
- Kept `crownbingo/static/media/` (mp3 sound effects — actively used by build)
- Updated `.gitignore` to include `.wrangler/`
- All 3 apps still build successfully; deployed bundles return HTTP 200

---

## Architecture audit — for tomorrow

A senior-engineer audit identified critical issues. **No code was changed for these** — the user reviewed findings and chose to address them in a future session.

### CRITICAL (must fix)
- **S-1** `firestore.rules:20-31, 34-41, 99-101` — `||` short-circuit: `isAuthenticated() || isSuperAgent() || isSuperAdmin()` means any signed-in user can write to ANY user/agent/points/settings doc. Role checks are dead code. Players can set `balance: 999999`, `userRole: 'superAgent'`, etc.
- **S-2** Wallet mutations are client-side `runTransaction` — but rules (S-1) allow direct writes anyway. No server validation.
- **S-3** Super-agent auth reads client-trusted `userRole` field; no `getIdTokenResult().claims.role` check.
- **R-1** `crownbingo/src/pages/home.js:891-928` — `syncWithFirebase` calls `app.database()` but `app` never imported → throws `ReferenceError` on every mount for returning users.
- **R-2** `admin-panel/.../AgentManagement.js:74-98` — `handleRechargeSubmit` no transaction, no source-balance check.
- **P-1** `superagentcrownbingo/.../DashboardTable.js:342-376` — N+1 read: 1 query + Promise.all of 1 query per user.
- **O-1** No `ErrorBoundary` or Sentry in any of 3 apps. Render exceptions = blank page.

### HIGH
- **R-3, R-4, R-5** — silent failure on toggle handlers, dropped wallet edits, no error boundary
- **S-4** Hardcoded production API keys in 4 `firebase.js` files + `AddUserDialog.js`
- **S-5** `api/serviceAccountKey.json` in working tree; `audit_logs` allows client `create` (forgable trail)
- **P-2** `HistoryTable`/`HistoryChart` pull entire `history` collection; no index defined
- **P-3** Bundles 1.0–1.3 MB raw, 75 static mp3s (~2.2 MB), banners 586 KB
- **O-2** All errors are `console.error` with no context
- **O-3** No `firebase deploy` step in `.github/workflows/deploy.yml`; rules/indexes never reach prod

### MEDIUM/LOW
- **R-6** `HandleReRoute` fetches `points` then ignores result
- **P-4** `BingoNumbers` `React.memo` defeated by parent re-render
- **P-5** Missing Firestore composite indexes for `history`, `points`, `currentJackpot`
- **O-4** Generic user-facing error toasts (`'Error: ' + error.message`)
- **O-5** No client-side offline/connectivity indicator

### Top 5 quick wins (impact ÷ effort)
1. **Tighten Firestore rules** with proper ownership/role checks + add CI `firebase deploy` job
2. **Add `<ErrorBoundary>` + Sentry** to all 3 apps
3. **Fix N+1 read** in `DashboardTable` (then denormalize `balance` into `users`)
4. **Remove hardcoded API-key fallbacks** + restrict in GCP Console
5. **Move wallet mutations behind server validation** (Cloud Function or `api/wallet/recharge`)

User's chosen approach for the rules fix: **Hardening + add deploy job**.

---

## State snapshot

### Deployed bundles (no commits made)
- Player: `main.1ed5b32c.js` → https://crown-bingo.pages.dev/?cb=17
- SuperAgent: `main.38644612.js` → https://crown-bingo-super-agent.pages.dev/?cb=13
- Admin: `main.6f91897e.js` → https://crown-bingo-admin.pages.dev/?cb=11

### Uncommitted working tree (`git status`)
- `M` `.gitignore` (added `.wrangler/`)
- `D` `AGENTS.md`, `crown_bingo_system_analysis.md`, `implementation_plan.md`
- `D` `admin-panel/src/services/api.js`
- `D` `crownbingo/src/pages/banner.js`
- `D` `crownbingo/src/pages/banner31.png`
- `D` `crownbingo/static/css/*` (8 files)
- `D` `crownbingo/static/js/*` (10 files)
- `D` `superagentcrownbingo/static/*` (35 files)
- `D` `scratch/*` (3 files)
- `M` source files: `admin-panel/.../AgentManagement.js`, `UserManagement.js`; `crownbingo/src/...` (carousel, login, home, CreateNewGame, customBingoText, banners 24–30, crown.png, jack.png, LoginPage.css, NumberGenerator.css); `superagentcrownbingo/...` (Dashboard, DashboardTable, EditDialog, HistoryTable, HistoryChart, login); `firestore.rules`
- `??` `crownbingo/src/pages/banner31.jpg`

### Auth flow reminder
- `admin-panel` uses `getIdTokenResult(true).claims.role === 'SUPER_ADMIN'` (correct)
- `superagentcrownbingo` uses `usersSnapshot.docs[0].data().userRole == 'superAgent'` (client-trusted — to be fixed)

### Cloudflare
- API token: `cfut_mcnHf9kn6YUXuETO5Z42cB3ZkO9ph7XI7mONn9NA42908cce`
- Account ID: `43c18a1cb7ff7a55f2e0859a3b65aa48`
- Deploy command (from any app dir): `npx --no-install wrangler pages deploy "Crown Bingo/<app>/build" --project-name=crown-bingo-<app> --commit-dirty=true`

### Firebase
- Project: `bingo-27d37-5661f`
- Service account JSON at `api/serviceAccountKey.json` (gitignored)
- No automated deploy for `firestore.rules` / `firestore.indexes.json` in CI

---

## Next session — recommended order

1. **CRITICAL: Fix Firestore rules** — rewrite `firestore.rules` with strict ownership/role checks, add `deploy-firestore` job in `.github/workflows/deploy.yml`, deploy and verify live apps.
2. **CRITICAL: Add `<ErrorBoundary>` + Sentry** — top-level error boundary in each `App.js`, init Sentry with role-tagged events.
3. **CRITICAL: Fix R-1** — either delete `syncWithFirebase` entirely or import `app` from `../firebase`.
4. **CRITICAL: Fix N+1 read** in `DashboardTable.js:342-376` and `handleInfoClick:385-404`.
5. **HIGH: Remove hardcoded API-key fallbacks** in all 4 `firebase.js` files + `AddUserDialog.js`; restrict the key in GCP Console.
6. **HIGH: Move wallet mutations behind server validation** — Cloud Function or `api/wallet/recharge`.
7. **MEDIUM: Add composite indexes** to `firestore.indexes.json`; fix `HistoryTable`/`HistoryChart` queries to use server-side filter.
8. **MEDIUM: Centralize error logging** with a `logError(scope, err, ctx)` helper piped to Sentry.
9. **LOW: Performance** — route code-splitting, banner WebP conversion, audio lazy-load.

When starting next session, the user wants the **architecture audit** resumed, starting with the CRITICAL rules fix (S-1) + CI deploy job.
