# Crown Bingo — Login Failure Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the login failure for users (`crownbingo` player app) and agents (`superagentcrownbingo` agent app) created via the admin panel, and ensure post-login data access (points, history, jackpot) works.

> **CRITICAL FINDING (added 2026-06-05 during Phase 2 smoke test):** The deployed `crownbingo` bundle at `crown-bingo.pages.dev` is stale — it was last deployed from commit `bf49eb4` and still contains the **OLD** Firebase apiKey (`...Or2o` for project `bingo-27d37`, project number `509582453061`). The repo's current `crownbingo/static/js/main.3fbd7db3.js` has the **correct** apiKey (`...S3do` for `bingo-27d37-5661f`). Login fails with `400 Bad Request` from `identitytoolkit.googleapis.com` because the old project no longer accepts auth requests. **Re-deploying the crownbingo directory to Netlify is required** to push the corrected bundle. This is added as **Phase 1.5** below.

**Architecture:** Deploy extended Firestore security rules (the primary blocker), patch legacy Firestore documents missing required role fields, and rebuild the superagent React bundle from its corrected `src/` source. The crownbingo app is not rebuildable from this repo, so its login relies solely on rule deployment.

**Tech Stack:** React 18, Firebase v10 SDK (Web), Firestore, Firebase CLI, Netlify (3 sites), Windows PowerShell.

---

## Root Cause Summary (from analysis)

| # | Bug | Status | Action |
|---|-----|--------|--------|
| 1 | Duplicate `initializeApp()` in `superagentcrownbingo/static/js/Components/login.js` | Source has bug, **but production bundle `main.d2281d5f.js` is already correct** (built from fixed `src/`) | Sync source for future hygiene + rebuild |
| 2 | `firestore.rules` not deployed to Firebase Console | **PRIMARY blocker** | Deploy via Console or CLI |
| 3 | `firestore.rules` missing `points`, `history`, `jackpotHistory`, `histories` (subcollection), `currentJackpot` | Post-login features will fail even after login | Extend rules |
| 4 | Legacy `users/{uid}` docs missing `userRole` field | Pre-admin-panel users + API-created users | Run patch tool |
| 5 | `admin-panel/src/firebase.js` has redundant `crownbingo` named-app init (same project) | Harmless but messy | Cleanup |

**Collections used by apps (verified by grep):**

| Collection | Used by | In current `firestore.rules`? |
|------------|---------|------------------------------|
| `users` | All 3 | ✅ |
| `agents` | admin-panel, superagent | ✅ |
| `transactions` | (declared, possibly unused) | ✅ |
| `games` | (declared, possibly unused) | ✅ |
| `bets` | (declared, possibly unused) | ✅ |
| `settings` | admin-panel | ✅ |
| `audit_logs` | admin-panel | ✅ |
| `points` | crownbingo, superagent | ❌ **MISSING** |
| `history` | crownbingo, superagent | ❌ **MISSING** |
| `jackpotHistory` | crownbingo | ❌ **MISSING** |
| `histories` (subcollection of `points`) | crownbingo, superagent | ❌ **MISSING** |
| `currentJackpot` (doc) | crownbingo | ❌ **MISSING** |

**Login error → cause mapping:**

| Error | Cause |
|-------|-------|
| `Login failed: Firebase App named '[DEFAULT]' already exists` | Stale superagent bundle (Bug #1) — not present in current production, but rebuild eliminates risk |
| `Login failed: Missing or insufficient permissions` | Rules blocking `users` read (Bug #2/#3) |
| `User data not found` | No `users` doc, or `uid` field missing/wrong |
| `Unauthorized access. User is not a super and agent` | Agent doc exists but `userRole` ≠ `superAgent` (Bug #4) |
| `Your account has been disabled` | `isDisabled: true` on user doc (correctly enforced) |

---

## Pre-flight: Active Rules Audit

**Before changing anything, you MUST check the actual rules currently published in Firebase Console.** Your fix is meaningless if the active rules differ from what's in the file.

### Task 0: Capture Active Rules Baseline

**Files:** None (read-only inspection)

- [ ] **Step 1: Open Firebase Console for project `bingo-27d37-5661f`**

Open: https://console.firebase.google.com/project/bingo-27d37-5661f/firestore/rules

- [ ] **Step 2: Note the current rules**

Copy the entire contents of the "Rules" editor into a scratch file (e.g., `scratch/active-rules-baseline.txt`):

```powershell
New-Item -ItemType Directory -Path "scratch" -Force | Out-Null
# After pasting from Console, save to:
# scratch/active-rules-baseline.txt
```

- [ ] **Step 3: Classify the baseline**

Determine which case applies:
- **Case A:** Rules are *less restrictive* than `firestore.rules` (e.g., test-mode `allow read, write: if request.time < timestamp.date(...)`) → apps may already work, but security is wide-open
- **Case B:** Rules are *more restrictive* (e.g., deny-all) → apps definitely fail, deploy the new rules
- **Case C:** Rules match `firestore.rules` file but still missing `points`/`history`/`jackpotHistory` → login works, post-login breaks
- **Case D:** Unknown / different schema entirely → investigate before deploying

**Record the case in your working notes** — this determines how to interpret test failures later.

- [ ] **Step 4: Commit baseline**

```powershell
git add scratch/active-rules-baseline.txt
git commit -m "docs: capture active firestore rules baseline"
```

If the `scratch/` directory is git-ignored (check `.gitignore`), use `git add -f scratch/active-rules-baseline.txt`.

---

## Phase 1: Extend `firestore.rules`

This phase adds the missing collection rules. After deployment, all reads/writes the apps perform will be allowed for authenticated users.

### Task 1.1: Write Failing Rule Audit (TDD-style)

**Files:** Create: `firestore.rules.audit.md`

Before extending rules, document every Firestore call the apps make. This makes the rule additions verifiable.

- [ ] **Step 1: Create the audit document**

```powershell
New-Item -ItemType File -Path "firestore.rules.audit.md" -Force | Out-Null
```

- [ ] **Step 2: Write the audit content with the verified calls**

Write the following to `firestore.rules.audit.md`:

```markdown
# Firestore Rules Coverage Audit

Generated: 2026-06-05

## Calls by app

### crownbingo (player app)
- `signInWithEmailAndPassword` (auth, not Firestore)
- `getDocs(query(collection(db,'users'), where('uid','==',authUid)))` — login
- `getDocs(query(collection(db,'points'), where('uid','==',uid)))` — load points
- `getDoc(doc(db,'points',uid))` — point lookup
- `updateDoc(pointsDoc.ref, {points})` — debit/credit
- `addDoc(collection(pointsRef,'histories'), {...})` — bet history
- `getDocs(collection(db,'history'))` (HistoryTable) — full history (agent view)
- `getDocs(query(collection(db,'jackpotHistory'), where('userId','==',uid)))` — jackpot
- `doc(db,'currentJackpot')` — current jackpot value
- `signOut()` (auth, not Firestore)

### superagentcrownbingo (agent app)
- `signInWithEmailAndPassword`
- `getDocs(query(collection(db,'users'), where('uid','==',authUid)))` — login
- `getDocs(collection(db,'points'))` — agent dashboard
- `getDocs(query(collection(db,'points'), where('uid','==',uid)))`
- `getDoc(doc(db,'points',uid))` — point lookup
- `getDoc(doc(db,'points',adminId))` — admin balance
- `getDocs(collection(pointsSnapshot.docs[0].ref,'histories'))` — bet history subcollection
- `getDocs(collection(db,'history'))` — global history

### admin-panel (super admin)
- `getDocs(collection(db,'users'))`
- `getDocs(collection(db,'agents'))`
- `getDocs(collection(db,'settings'))`
- `getDocs(collection(db,'audit_logs'))`
- `getDocs(collection(db,'bets'))`
- `createUserWithEmailAndPassword` (auth)
- `setDoc(doc(db,'users',uid), data)`
- `setDoc(doc(db,'agents',uid), data)`
- `updateDoc(...)` on users/agents
- `deleteDoc(...)` on users/agents

## Collections referenced (must be in rules)

| Collection | Path | Used by |
|------------|------|---------|
| users | /users/{uid} | All 3 |
| agents | /agents/{uid} | admin-panel, superagent |
| points | /points/{uid} | crownbingo, superagent |
| points/{uid}/histories | subcollection | crownbingo, superagent |
| history | /history/{id} | crownbingo, superagent |
| jackpotHistory | /jackpotHistory/{id} | crownbingo |
| currentJackpot | /currentJackpot (doc) | crownbingo |
| settings | /settings/{id} | admin-panel |
| audit_logs | /audit_logs/{id} | admin-panel |
| bets | /bets/{id} | admin-panel (declared) |
| transactions | /transactions/{id} | (declared, app code uses it in api/) |
| games | /games/{id} | (declared, app code uses it in api/) |
```

- [ ] **Step 3: Commit audit**

```powershell
git add firestore.rules.audit.md
git commit -m "docs: audit firestore calls to inform rules extension"
```

### Task 1.2: Extend `firestore.rules`

**Files:** Modify: `firestore.rules` (replace entire contents)

- [ ] **Step 1: Replace `firestore.rules` with extended version**

Overwrite `firestore.rules` with the following complete content:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    // ─── Identity & access ────────────────────────────────────────────
    match /users/{userId} {
      allow read, write: if isAuthenticated();
    }

    match /agents/{agentId} {
      allow read, write: if isAuthenticated();
    }

    // ─── Player wallet & ledger ───────────────────────────────────────
    match /points/{pointId} {
      allow read, write: if isAuthenticated();

      // Per-user bet histories live as a subcollection of the points doc
      match /histories/{historyId} {
        allow read, write: if isAuthenticated();
      }
    }

    match /history/{historyId} {
      allow read, write: if isAuthenticated();
    }

    // ─── Jackpot ───────────────────────────────────────────────────────
    match /jackpotHistory/{entryId} {
      allow read, write: if isAuthenticated();
    }

    match /currentJackpot {
      allow read, write: if isAuthenticated();

      match /{document=**} {
        allow read, write: if isAuthenticated();
      }
    }

    // ─── Transactions & games (api/ writes; clients may also read) ────
    match /transactions/{txnId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
                    request.resource.data.amount > 0 &&
                    request.resource.data.amount <= 10000 &&
                    request.resource.data.userId == request.auth.uid &&
                    request.resource.data.status == 'PENDING';
      allow update: if false;
      allow delete: if false;
    }

    match /games/{gameId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if false;
      allow delete: if false;
    }

    match /bets/{betId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
                    request.resource.data.userId == request.auth.uid &&
                    request.resource.data.amount > 0 &&
                    request.resource.data.amount <= 1000 &&
                    request.resource.data.gameId != null &&
                    request.resource.data.status == 'ACTIVE';
      allow update: if false;
      allow delete: if false;
    }

    // ─── System ────────────────────────────────────────────────────────
    match /settings/{settingId} {
      allow read, write: if isAuthenticated();
    }

    match /audit_logs/{logId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }

    // ─── Catch-all: deny everything else ──────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Verify the file is valid rules syntax**

```powershell
# The Firebase CLI's emulators command validates the file, but is heavyweight.
# As a quick sanity check, ensure it parses as JSON-ish balanced braces:
$content = Get-Content -LiteralPath "firestore.rules" -Raw
$open  = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
$close = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
if ($open -ne $close) { throw "Unbalanced braces: $open open vs $close close" }
Write-Output "OK: $open balanced brace pairs"
```

Expected: `OK: N balanced brace pairs` (no exception).

- [ ] **Step 3: Commit**

```powershell
git add firestore.rules
git commit -m "feat(rules): add points, history, jackpotHistory, currentJackpot rules

- Add /points and /points/{id}/histories (read/write for authenticated)
- Add /history (read/write for authenticated)
- Add /jackpotHistory (read/write for authenticated)
- Add /currentJackpot doc + subcollection (read/write for authenticated)

Fixes post-login PERMISSION_DENIED errors on player and agent apps."
```

---

## Phase 1.5: Re-Deploy Crownbingo (CRITICAL — discovered during smoke test)

The crownbingo player app is a static site that was last deployed from commit `bf49eb4`. The repo's current `crownbingo/static/js/main.3fbd7db3.js` (2,918,239 bytes, apiKey `...S3do`) differs from the live bundle (2,855,866 bytes, apiKey `...Or2o`). Login fails because the live app authenticates against the wrong Firebase project.

The repo's `crownbingo/.netlify/state.json` shows the site is linked to Netlify (siteId `17749eab-218d-4ce8-92ba-04aad958880c`). The Netlify CLI is installed and authenticated.

> **Note:** The live URL `crown-bingo.pages.dev` is a Cloudflare Pages subdomain. Netlify deploys may not update this URL directly. The user must verify after deploy.

### Task 1.5.1: Verify Netlify CLI and Site Link

**Files:** None (read-only)

- [ ] **Step 1: Confirm `netlify --version` works**

```powershell
netlify --version
```

Expected: `netlify-cli/X.X.X win32-x64 node-vX.X.X`

- [ ] **Step 2: Verify the crownbingo site is linked**

```powershell
Get-Content -LiteralPath "crownbingo\.netlify\state.json"
```

Expected: `{"siteId": "17749eab-218d-4ce8-92ba-04aad958880c"}`

If the siteId differs, stop and report BLOCKED.

### Task 1.5.2: Re-Deploy Crownbingo

**Files:** None (deployment only)

- [ ] **Step 1: Deploy the crownbingo directory to Netlify**

```powershell
cd crownbingo
netlify deploy --prod --dir=.
```

Expected output (truncated):
```
Deploying to production site URL...
✔ Finished hashing 142 files
✔ CDN requesting 0 files
✔ Finished uploading 0 assets
✔ Deploy is live!

Production URL: https://17749eab-218d-4ce8-92ba-04aad958880c.netlify.app
```

If deploy fails with auth errors, stop and report BLOCKED (do not re-authenticate).

- [ ] **Step 2: Verify the new bundle is served at the live URL**

```powershell
$liveBundle = (Invoke-WebRequest -Uri "https://crown-bingo.pages.dev/static/js/main.3fbd7db3.js" -UseBasicParsing -TimeoutSec 30).Content
$or2oCount = ([regex]::Matches($liveBundle, 'Or2o')).Count
$s3doCount = ([regex]::Matches($liveBundle, 'S3do')).Count
Write-Output "LIVE bundle: Or2o=$or2oCount, S3do=$s3doCount, length=$($liveBundle.Length)"
```

Expected: `Or2o=0, S3do=4, length=2918239` (or close — Cloudflare cache may lag a few seconds).

If `Or2o>0` after 5 minutes of waiting, the Cloudflare Pages cache hasn't refreshed. Try a hard refresh in the browser (`Ctrl+Shift+R`) or wait longer.

- [ ] **Step 3: Record the deployment**

```powershell
"Crownbingo redeployed to Netlify at $(Get-Date -Format o)" | Out-File -FilePath "scratch\crownbingo-redeploy.log" -Append
```

### Task 1.5.3: Verify Login on Player App (MANUAL)

- [ ] **Step 1: Open the player app with cache-busting**

Open: `https://crown-bingo.pages.dev/?cb=$(Get-Random)`

- [ ] **Step 2: Sign in with a test user**

Expected: 
- `signInWithEmailAndPassword` succeeds (no 400 Bad Request)
- Either redirects to home or shows expected error (e.g., "User data not found" if no users doc)
- **No** `PERMISSION_DENIED` errors in Console

If the 400 Bad Request persists after a hard refresh, the Cloudflare cache is still stale. Wait 5-10 minutes and retry, or purge cache via Cloudflare dashboard.

---

## Phase 2: Deploy Firestore Rules

Pick ONE of the two deployment methods below. **Do not skip this phase** — nothing in Phase 3+ can succeed until rules are live.

### Task 2A: Deploy via Firebase Console (recommended for this project)

**Files:** None (manual operation)

- [ ] **Step 1: Open Rules editor**

Open: https://console.firebase.google.com/project/bingo-27d37-5661f/firestore/rules

- [ ] **Step 2: Replace contents**

1. Click in the rules editor (`Ctrl+A` to select all)
2. Delete current contents
3. Paste the **entire** contents of the updated `firestore.rules`
4. Click **Publish**
5. Confirm the "Rules published" toast appears

- [ ] **Step 3: Verify deployment**

Wait ~30 seconds, then refresh the page. The rules shown should match `firestore.rules` exactly. If they don't, repeat Step 2.

- [ ] **Step 4: Record the deployment**

```powershell
"Rules deployed at $(Get-Date -Format o)" | Out-File -FilePath "scratch/rules-deploy.log" -Append
```

### Task 2B (alternative): Deploy via Firebase CLI

**Files:** None (uses existing `firebase.json` and `.firebaserc`)

Skip this task if you completed Task 2A.

- [ ] **Step 1: Verify Firebase CLI is installed and authenticated**

```powershell
firebase --version
firebase projects:list
```

If not authenticated:
```powershell
firebase login --no-localhost
```

- [ ] **Step 2: Verify project is `bingo-27d37-5661f`**

```powershell
firebase use bingo-27d37-5661f
```

Expected: `Now using project bingo-27d37-5661f`

- [ ] **Step 3: Deploy rules and indexes**

```powershell
firebase deploy --only firestore:rules,firestore:indexes --project bingo-27d37-5661f
```

Expected output (truncated):
```
=== Deploying to 'bingo-27d37-5661f'...

i  firestore: uploading rules firestore.rules
i  firestore: uploading indexes firestore.indexes.json
✔  firestore: deployed indexes in firestore.indexes.json successfully
✔  firestore: rules released to cloud.firestore
✔  Deploy complete!
```

- [ ] **Step 4: Record the deployment**

```powershell
"Rules+indexes deployed via CLI at $(Get-Date -Format o)" | Out-File -FilePath "scratch/rules-deploy.log" -Append
```

### Task 2.3: Smoke-Test Rules with a Quick Query

**Files:** None (browser DevTools)

- [ ] **Step 1: Open the player app and sign in**

1. Open https://crown-bingo.pages.dev
2. Open DevTools → Console
3. Sign in with a test user
4. Watch for errors in the Console

- [ ] **Step 2: Check for `PERMISSION_DENIED` errors**

Expected: **No** `FirebaseError: Missing or insufficient permissions` errors during sign-in or on the post-login home screen.

If you see `PERMISSION_DENIED`:
1. Wait 60 seconds (rules propagation can lag)
2. Hard-refresh (`Ctrl+Shift+R`)
3. If still failing, re-check `firestore.rules` was published correctly (Task 2A Step 3)
4. If still failing, paste the full error and the active rules into a new issue — do not continue to Phase 3

- [ ] **Step 3: Open the agent app and sign in**

1. Open https://crown-bingo-super-agent.pages.dev
2. Sign in with a test agent
3. Verify dashboard loads (or shows "No data" without errors)

Expected: Login succeeds; dashboard either shows data or shows empty state. **No** `PERMISSION_DENIED` errors.

---

## Phase 3: Patch Legacy Data

Even with rules deployed, agents created before the admin panel wrote `userRole` will fail login. The `admin-panel/patch.html` tool already exists to fix this.

### Task 3.1: Run the Patch Tool

**Files:** Use: `admin-panel/patch.html` (existing)

- [ ] **Step 1: Open the patch tool**

The file is at `admin-panel/patch.html`. Deploy options:
- **Option A (local):** Serve it with the existing static server:
  ```powershell
  cd admin-panel
  python -m http.server 8080
  ```
  Then open http://localhost:8080/patch.html
- **Option B (deployed):** If you previously deployed `admin-panel` to Netlify, navigate to `https://crown-bingo-admin.pages.dev/patch.html`

- [ ] **Step 2: Sign in as SUPER_ADMIN**

Enter your super-admin email and password, click "Sign In to Firebase".

Expected: Log shows `✅ SUPER_ADMIN verified. Ready to patch.`

- [ ] **Step 3: Run the patch**

Click "🚀 Fix All Existing Users & Agents".

Expected log output (truncated):
```
=== PATCH STARTED ===
Reading users collection…
Found N user document(s).
  [USER] user@example.com → adding role:user
  [AGENT in users] agent@example.com → adding userRole:superAgent
  [OK] other@example.com role=user userRole=—
Reading agents collection…
Found M agent document(s).
  [OK] Agent ...
=== PATCH COMPLETE ===
Fixed: K record(s) | Errors: 0
```

- [ ] **Step 4: Verify the fix**

```powershell
"Patch ran at $(Get-Date -Format o). Check patch.html UI for fixed count." | Out-File -FilePath "scratch/rules-deploy.log" -Append
```

If `Errors > 0`, the most likely cause is rules not yet propagated — wait 60s and re-run.

### Task 3.2: Verify a Patched Agent Can Log In

- [ ] **Step 1: Open the agent app**

https://crown-bingo-super-agent.pages.dev

- [ ] **Step 2: Sign in with a freshly-patched agent**

Expected: Login succeeds, dashboard loads. No "Unauthorized access" error.

If still failing:
1. Open the agent's `users/{uid}` doc in Firebase Console → Firestore → Data
2. Confirm fields: `userRole: "superAgent"`, `role: "agent"`, `isDisabled: false`
3. If `isDisabled: true`, set it to `false` manually in the Console

---

## Phase 4: Sync Superagent Source

The `static/js/Components/login.js` (which Netlify publishes as the live app) is **not** used at runtime — the production bundle `main.d2281d5f.js` (built from `src/`) is. However, syncing the source prevents future confusion if anyone rebuilds or audits the static copy.

### Task 4.1: Verify the Source and Static Copies Diverge

**Files:** Read: `superagentcrownbingo/src/Components/login.js`, `superagentcrownbingo/static/js/Components/login.js`

- [ ] **Step 1: Confirm the source has the fix**

Read `superagentcrownbingo/src/Components/login.js` and confirm lines 1-30 contain:

```js
import React from 'react';
import { Container, Paper, Typography, TextField, Button } from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
...
import { db } from '../firebase';
```

(There should be NO `initializeApp` call and NO `firebaseConfig` literal — the source imports `db` from the shared `../firebase` module.)

- [ ] **Step 2: Confirm the static copy has the bug**

Read `superagentcrownbingo/static/js/Components/login.js` and confirm it contains the duplicate init:

```js
const firebaseConfig = {
    apiKey: "AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do",
    ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
```

(If this is NOT in the static copy, skip the sync — someone already did it.)

### Task 4.2: Replace the Static Copy

**Files:** Modify: `superagentcrownbingo/static/js/Components/login.js` (replace with `src/` version)

Skip this task if Step 2 of Task 4.1 confirmed the static copy is already correct.

- [ ] **Step 1: Copy the corrected source over the static copy**

```powershell
Copy-Item -LiteralPath "superagentcrownbingo\src\Components\login.js" -Destination "superagentcrownbingo\static\js\Components\login.js" -Force
```

- [ ] **Step 2: Verify the static copy now matches the source**

```powershell
$src    = Get-FileHash -LiteralPath "superagentcrownbingo\src\Components\login.js" -Algorithm SHA256
$static = Get-FileHash -LiteralPath "superagentcrownbingo\static\js\Components\login.js" -Algorithm SHA256
if ($src.Hash -ne $static.Hash) { throw "Files still differ after copy" }
Write-Output "OK: files match"
```

Expected: `OK: files match`

- [ ] **Step 3: Commit**

```powershell
git add superagentcrownbingo/static/js/Components/login.js
git commit -m "fix(superagent): sync static/js/Components/login.js with src/

Removes duplicate initializeApp() from the published copy.
The production bundle main.d2281d5f.js was already built from the
correct src/, so this is a hygiene fix to prevent future drift."
```

---

## Phase 5: Rebuild Superagent

The production bundle is already correct, but rebuilding ensures a fresh bundle that matches the latest `src/`. This requires `npm install` (network access).

### Task 5.1: Install Dependencies

**Files:** Uses: `superagentcrownbingo/package.json` (existing)

- [ ] **Step 1: Check for existing `node_modules`**

```powershell
if (Test-Path -LiteralPath "superagentcrownbingo\node_modules") {
  Write-Output "node_modules exists"
} else {
  Write-Output "node_modules missing"
}
```

- [ ] **Step 2: Install (or verify) dependencies**

If missing OR if `package.json` was modified:
```powershell
cd superagentcrownbingo
npm install
```

Expected: completes with `added N packages` and no `ERR!` lines.

If `node_modules` exists and `package.json` is unchanged, you can skip the install (npm will be a no-op).

- [ ] **Step 3: Return to repo root**

```powershell
cd ..
```

### Task 5.2: Build the Production Bundle

**Files:** Produces: `superagentcrownbingo/build/static/js/main.*.js` and `asset-manifest.json`

- [ ] **Step 1: Run the build with `CI=false` to avoid ESLint-as-errors**

```powershell
cd superagentcrownbingo
$env:CI = "false"
npm run build
```

Expected output (truncated):
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  N.NN KB  build/static/js/main.XXXX.js
  ...
The project was built assuming it is hosted at /.
```

- [ ] **Step 2: Confirm new bundle is generated**

```powershell
Get-ChildItem -LiteralPath "superagentcrownbingo\build\static\js" -Filter "main.*.js" | Select-Object Name, Length
```

Expected: One file with name pattern `main.<hash>.js`. Note the hash — it will differ from `main.d2281d5f.js`.

- [ ] **Step 3: Verify the new bundle has the correct login code (no duplicate init)**

```powershell
$bundle = Get-ChildItem -LiteralPath "superagentcrownbingo\build\static\js" -Filter "main.*.js" | Select-Object -First 1
$content = Get-Content -LiteralPath $bundle.FullName -Raw
# The fixed bundle should NOT contain a top-level initializeApp call inside the login component
$loginCodeCount = ([regex]::Matches($content, "onSubmit:")).Count
$superAgentCount = ([regex]::Matches($content, '"superAgent" ==')).Count
if ($loginCodeCount -lt 1) { throw "Bundle missing login component" }
if ($superAgentCount -lt 1) { throw "Bundle missing superAgent role check" }
Write-Output "OK: bundle has $($loginCodeCount)x onSubmit + $($superAgentCount)x superAgent check"
```

Expected: `OK: bundle has 1x onSubmit + 1x superAgent check` (or higher counts for legitimate reasons).

- [ ] **Step 4: Return to repo root**

```powershell
cd ..
```

### Task 5.3: Copy Build Output to Static Directory

The Netlify `publish` for `superagentcrownbingo` is `.` (the app root), so the bundle must be copied into `static/js/` for the existing `index.html` to load it. The current `index.html` references `main.d2281d5f.js` by hash; after rebuild, the new hash must be referenced.

**Files:** Modify: `superagentcrownbingo/index.html`, `superagentcrownbingo/static/js/main.<oldHash>.js` (delete), `superagentcrownbingo/static/css/main.<oldHash>.css` (delete)

- [ ] **Step 1: Copy new bundle + CSS into `static/`**

```powershell
$bundle = Get-ChildItem -LiteralPath "superagentcrownbingo\build\static\js" -Filter "main.*.js" | Select-Object -First 1
$css    = Get-ChildItem -LiteralPath "superagentcrownbingo\build\static\css" -Filter "main.*.css" | Select-Object -First 1
$newBundleName = $bundle.Name
$newCssName    = $css.Name

Copy-Item -LiteralPath $bundle.FullName -Destination "superagentcrownbingo\static\js\$newBundleName" -Force
Copy-Item -LiteralPath $css.FullName    -Destination "superagentcrownbingo\static\css\$newCssName" -Force

Write-Output "Copied: $newBundleName + $newCssName"
```

- [ ] **Step 2: Update `index.html` with new hashes**

```powershell
$htmlPath = "superagentcrownbingo\index.html"
$html = Get-Content -LiteralPath $htmlPath -Raw
$html = $html -replace 'main\.[0-9a-f]+\.js', $newBundleName
$html = $html -replace 'main\.[0-9a-f]+\.css', $newCssName
Set-Content -LiteralPath $htmlPath -Value $html -NoNewline
Write-Output "Updated index.html"
```

- [ ] **Step 3: Delete the old static bundle and CSS**

```powershell
Remove-Item -LiteralPath "superagentcrownbingo\static\js\main.d2281d5f.js" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "superagentcrownbingo\static\css\main.3572f698.css" -Force -ErrorAction SilentlyContinue
```

- [ ] **Step 4: Verify `index.html` references the new hash**

```powershell
$ref = Select-String -Path "superagentcrownbingo\index.html" -Pattern "main\.[0-9a-f]+\.(js|css)"
$ref | ForEach-Object { Write-Output $_.Line }
```

Expected: 2 lines, one for `.js` and one for `.css`, both with the new hash.

- [ ] **Step 5: Commit**

```powershell
git add superagentcrownbingo/index.html
git add superagentcrownbingo/static/js/main.*.js
git add superagentcrownbingo/static/css/main.*.css
git add superagentcrownbingo/build 2>$null
git status
```

Note: `superagentcrownbingo/build` is typically git-ignored. If your `.gitignore` excludes it, the `git add` will fail — that's fine, skip it.

```powershell
git commit -m "build(superagent): rebuild production bundle from src/

New bundle hash replaces main.d2281d5f.js. Built from corrected src/
which uses shared db/auth instead of duplicate initializeApp()."
```

- [ ] **Step 6: Push and trigger Netlify redeploy**

```powershell
git push origin main
```

Netlify watches the repo; the next push auto-deploys the superagent site. Watch the Netlify dashboard for the build to complete (~1-2 min).

### Task 5.4: Verify Live Deployment

- [ ] **Step 1: Open the agent app with cache-busting**

Open: `https://crown-bingo-super-agent.pages.dev/?cb=$(Get-Random)`

- [ ] **Step 2: Open DevTools → Network tab → filter JS**

Find the new `main.<hash>.js` request. Verify the URL matches the hash in the just-committed `index.html`.

- [ ] **Step 3: Sign in with a test agent**

Expected: Login succeeds. No "Firebase App named '[DEFAULT]' already exists" error in Console.

If the error appears, the new bundle did not actually deploy — hard-refresh (`Ctrl+Shift+R`).

---

## Phase 6: Cleanup Admin Panel `firebase.js`

Optional but recommended. Removes the redundant named Firebase app init.

### Task 6.1: Remove Redundant `crownbingo` App Init

**Files:** Modify: `admin-panel/src/firebase.js`

- [ ] **Step 1: Verify both configs are identical**

Read `admin-panel/src/firebase.js` lines 7-25 and confirm `firebaseConfig` and `crownbingoConfig` have identical values (just the `apiKey` through `appId` block).

- [ ] **Step 2: Replace the file with a single-app init**

Overwrite `admin-panel/src/firebase.js` with:

```js
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do',
  authDomain: 'bingo-27d37-5661f.firebaseapp.com',
  projectId: 'bingo-27d37-5661f',
  storageBucket: 'bingo-27d37-5661f.firebasestorage.app',
  messagingSenderId: '330815222659',
  appId: '1:330815222659:web:4890bf5cddc728bf29bcb6',
  measurementId: 'G-CD4DWDC8SW'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* analytics unavailable */ }

export {
  auth, db, storage, analytics,
  onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
};
```

- [ ] **Step 3: Update imports of removed exports**

Anywhere `crownbingoAuth` or `crownbingoDb` is imported, replace with `auth` and `db`.

Find usages:
```powershell
Select-String -Path "admin-panel\src\**\*.js" -Pattern "crownbingoAuth|crownbingoDb" -ErrorAction SilentlyContinue
```

For each file, replace:
- `import { ..., crownbingoAuth, crownbingoDb, ... } from '../../firebase'` → `import { ..., auth, db, ... } from '../../firebase'`
- `crownbingoAuth` → `auth`
- `crownbingoDb` → `db`
- `doc(crownbingoDb, ...)` → `doc(db, ...)`
- `createUserWithEmailAndPassword(crownbingoAuth, ...)` → `createUserWithEmailAndPassword(auth, ...)`

Affected files (verified during plan authoring):
- `admin-panel/src/components/pages/UserManagement.js`
- `admin-panel/src/components/pages/AgentManagement.js`

- [ ] **Step 4: Verify no remaining references**

```powershell
Select-String -Path "admin-panel\src\**\*.js" -Pattern "crownbingoAuth|crownbingoDb" -ErrorAction SilentlyContinue
```

Expected: no output.

- [ ] **Step 5: Build to verify**

```powershell
cd admin-panel
$env:CI = "false"
npm run build
```

Expected: `Compiled successfully.`

- [ ] **Step 6: Return and commit**

```powershell
cd ..
git add admin-panel/src/firebase.js
git add admin-panel/src/components/pages/UserManagement.js
git add admin-panel/src/components/pages/AgentManagement.js
git commit -m "refactor(admin-panel): remove redundant crownbingo Firebase app init

Both firebaseConfig and crownbingoConfig pointed to the same project
(bingo-27d37-5661f), so the named 'crownbingo' app was a duplicate.
Consolidates to a single default app export."
```

---

## Phase 7: End-to-End Verification

This phase exercises the full login + post-login flow on all 3 apps.

### Task 7.1: Player App Login Test

- [ ] **Step 1: Open the player app**

https://crown-bingo.pages.dev

- [ ] **Step 2: Create a fresh test user in the admin panel**

In `crown-bingo-admin.pages.dev` → User Management → Add New User:
- email: `playertest+$(Get-Random)@example.com`
- password: `TestPass123!`
- username: `playertest`
- balance: 100

Expected toast: `User created successfully`

- [ ] **Step 3: Sign in as that user on the player app**

Enter the new credentials. Click Sign In.

Expected:
- Toast: `Login successful` (or no error)
- Redirect to `/NewGame`
- No "Login failed:" error in the Console

- [ ] **Step 4: Verify post-login data loads**

On the home screen, the points balance should display `100` (or your entered balance).

If the balance is missing or shows an error:
1. Open Console
2. Look for `PERMISSION_DENIED` errors
3. If present, rules are missing a collection — return to Phase 1

### Task 7.2: Agent App Login Test

- [ ] **Step 1: Open the agent app**

https://crown-bingo-super-agent.pages.dev

- [ ] **Step 2: Create a fresh test agent in the admin panel**

In `crown-bingo-admin.pages.dev` → Agent Management → Add New Agent:
- email: `agenttest+$(Get-Random)@example.com`
- password: `TestPass123!`
- agentName: `agenttest`
- agentCode: `AGT$(Get-Random -Maximum 9999)`
- commissionRate: 5

Expected toast: `Agent created successfully`

- [ ] **Step 3: Verify the user doc has the right fields**

In Firebase Console → Firestore → Data → `users/{uid}` for the new agent:
- `userRole: "superAgent"` ✓
- `role: "agent"` ✓
- `isDisabled: false` ✓

- [ ] **Step 4: Sign in as that agent on the agent app**

Enter the new credentials. Click Sign In.

Expected:
- Toast: `Login successful`
- Redirect to `/Dashboard`
- No "Firebase App named '[DEFAULT]' already exists" error
- No "Unauthorized access" error

- [ ] **Step 5: Verify dashboard loads data**

The dashboard should show a list of users or empty state without errors. Open Console and verify no red errors.

### Task 7.3: Admin Panel Regression Test

- [ ] **Step 1: Open the admin panel**

https://crown-bingo-admin.pages.dev

- [ ] **Step 2: Sign in as SUPER_ADMIN**

- [ ] **Step 3: Navigate to User Management, Agent Management, Settings, Audit Log**

For each page, verify:
- Data loads (or shows empty state)
- No `PERMISSION_DENIED` errors
- No "Firebase App" errors

If `PERMISSION_DENIED` appears on Audit Log, the catch-all deny is blocking the `audit_logs` query — re-check `firestore.rules` was published.

- [ ] **Step 4: Create one more user and one more agent**

Verify the new records have all required fields by inspecting the Firestore `users/{uid}` doc.

### Task 7.4: Document Verification Results

- [ ] **Step 1: Create a verification log**

```powershell
$log = @"
Verification completed: $(Get-Date -Format o)
- Player app login (new user): PASS/FAIL
- Agent app login (new agent): PASS/FAIL
- Admin panel: PASS/FAIL
- Post-login data (points, history, jackpot): PASS/FAIL

Notes:
$(Get-Content -Raw scratch/rules-deploy.log -ErrorAction SilentlyContinue)
"@
$log | Out-File -FilePath "scratch/verification-$(Get-Date -Format yyyyMMdd).log"
```

- [ ] **Step 2: Commit verification log**

```powershell
git add scratch/verification-*.log
git commit -m "docs: record login fix verification results"
```

If `scratch/` is git-ignored, use `git add -f`.

---

## Rollback Plan

If a regression is discovered after deployment:

### Rollback Firestore Rules

1. Open https://console.firebase.google.com/project/bingo-27d37-5661f/firestore/rules
2. Restore the previous rules (from `scratch/active-rules-baseline.txt` or git history)
3. Click **Publish**

To find the previous rules in git:
```powershell
git show HEAD~N:firestore.rules
```

where `N` is the number of commits back to the last known-good rules. Then paste into the Console.

### Rollback Superagent Bundle

1. Restore the old `main.d2281d5f.js` from git:
   ```powershell
   git checkout HEAD~1 -- superagentcrownbingo/static/js/main.d2281d5f.js
   git checkout HEAD~1 -- superagentcrownbingo/static/css/main.3572f698.css
   git checkout HEAD~1 -- superagentcrownbingo/index.html
   git commit -m "revert: restore previous superagent bundle"
   git push
   ```

### Rollback Legacy Data Patch

The patch only **adds** missing fields; it does not delete data. To revert, manually clear the patched fields in Firebase Console → Firestore → Data.

---

## Completion Checklist

- [ ] Active rules baseline captured (`scratch/active-rules-baseline.txt`)
- [ ] `firestore.rules` extended with `points`, `history`, `jackpotHistory`, `currentJackpot`, `histories`
- [ ] Rules deployed to Firebase Console (or CLI) and verified
- [ ] Legacy data patched via `admin-panel/patch.html`; patched agent can log in
- [ ] `superagentcrownbingo/static/js/Components/login.js` synced with `src/`
- [ ] Superagent bundle rebuilt; new hash deployed; live site serves new bundle
- [ ] (Optional) `admin-panel/src/firebase.js` consolidated; admin panel still works
- [ ] Player app: new user login + post-login data works
- [ ] Agent app: new agent login + post-login data works
- [ ] Admin panel: no regressions
- [ ] Verification log committed

---

## Out of Scope (Future Work)

These items were observed during analysis but are NOT fixed by this plan:

1. **Crownbingo source re-buildability** — `crownbingo/` only has pre-built bundles, no React `src/`. If the bundle needs changes, the original source must be obtained elsewhere.
2. **Custom claims on Auth** — `role: "SUPER_ADMIN"` custom claim may not be set on admin user(s). This doesn't block login but limits role-based client checks.
3. **Tightened rules** — Current rules allow any authenticated user to read/write any user doc, any points doc, etc. A future hardening pass should restrict writes (e.g., only server-side API can modify `points`).
4. **Composite indexes** — `firestore.indexes.json` is deployed but some queries (e.g., `history` ordered by `date`) may still need additional indexes. Watch for `FAILED_PRECONDITION` errors in production.
5. **REST API parity** — `api/routes/users.js` creates agents without `users` doc / `userRole`. Future: align with admin-panel creation logic.
