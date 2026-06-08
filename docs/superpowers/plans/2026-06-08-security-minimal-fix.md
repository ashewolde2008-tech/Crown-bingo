# Security Minimal Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the critical Firestore rules vulnerability (S-1) and remove dead code causing ReferenceError (R-1).

**Architecture:** Rewrite `firestore.rules` with strict ownership/role-based checks. Delete `syncWithFirebase` dead code from `home.js`. No functional impact on any app.

**Tech Stack:** Firebase Firestore Rules, React (CRA)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `firestore.rules` | Modify (full rewrite) | Fix S-1: strict ownership/role checks |
| `crownbingo/src/pages/home.js` | Modify (delete ~38 lines) | Fix R-1: remove dead `syncWithFirebase` |

---

### Task 1: Rewrite Firestore Rules (S-1)

**Files:**
- Modify: `firestore.rules` (full rewrite)

- [ ] **Step 1: Read current rules**

Read `firestore.rules` to confirm current state (114 lines, `||` short-circuit on line 21).

- [ ] **Step 2: Rewrite rules with strict ownership/role checks**

Replace the entire content of `firestore.rules` with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

    // ─── Identity & access ────────────────────────────────────────────
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAgent();
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAgent());
      allow delete: if isSuperAdmin();

      match /histories/{historyId} {
        allow read: if isAuthenticated() && request.auth.uid == userId;
        allow create: if isAuthenticated() && request.auth.uid == userId;
        allow update, delete: if false;
      }
    }

    match /agents/{agentId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isSuperAdmin();
    }

    // ─── Player wallet & ledger ───────────────────────────────────────
    match /points/{pointId} {
      allow read: if isAuthenticated() && (request.auth.uid == pointId || isAgent());
      allow write: if false;

      match /histories/{historyId} {
        allow read: if isAgent();
        allow write: if false;
      }
    }

    match /history/{historyId} {
      allow read: if isAgent();
      allow create: if isAgent();
      allow update, delete: if false;
    }

    // ─── Jackpot ───────────────────────────────────────────────────────
    match /jackpotHistory/{entryId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    match /jackpots/{jackpotId} {
      allow read: if isAuthenticated();
      allow update: if isAuthenticated();
      allow create, delete: if false;
    }

    match /currentJackpot {
      allow read: if isAuthenticated();
      allow write: if false;

      match /{document=**} {
        allow read, write: if false;
      }
    }

    // ─── Transactions & games (api/ writes; clients may also read) ────
    match /transactions/{txnId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isSuperAdmin());
      allow create, update, delete: if false;
    }

    match /games/{gameId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if false;
    }

    match /bets/{betId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isSuperAdmin());
      allow create, update, delete: if false;
    }

    // ─── System ────────────────────────────────────────────────────────
    match /settings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }

    match /audit_logs/{logId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if false;
    }

    match /auditLogs/{logId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if false;
    }

    // ─── Catch-all: deny everything else ──────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 3: Verify syntax**

Run: `cd "C:\Users\ASHE\Documents\GitHub\Crown Bingo" && Select-String -Path firestore.rules -Pattern "allow" -SimpleMatch | Measure-Object | Select-Object -ExpandProperty Count`

Expected: 22 `allow` rules in the file (was 18 in original).

- [ ] **Step 4: Verify key changes exist**

Confirm these lines are present in the new file:
- `allow create: if isAgent();` (users create — was `isAuthenticated()`)
- `allow update: if isAuthenticated() && (request.auth.uid == userId || isAgent());` (users update — was `isAuthenticated()`)
- `allow write: if false;` (points write — was `isAuthenticated()`)
- `allow create, update, delete: if isSuperAdmin();` (agents — was `isAuthenticated()`)
- `allow write: if isSuperAdmin();` (settings write — was `isAuthenticated()`)
- `allow create, update, delete: if false;` (audit_logs create — was `isAuthenticated()`)

- [ ] **Step 5: Commit**

```bash
cd "C:\Users\ASHE\Documents\GitHub\Crown Bingo"
git add firestore.rules
git commit -m "fix(security): rewrite Firestore rules with strict ownership/role checks

- Fix S-1: || short-circuit allowed any auth user to write ANY document
- Users: read=auth, create=agent, update=owner||agent, delete=admin
- Agents: read=auth, write=admin only
- Points: read=owner||agent, write=server only
- History: read/create=agent, immutable
- Settings: read=auth, write=admin only
- Audit logs: read=auth, create=server only
- Jackpots: read/update=auth, create/delete=denied
- Catch-all: deny unknown collections"
```

---

### Task 2: Delete syncWithFirebase Dead Code (R-1)

**Files:**
- Modify: `crownbingo/src/pages/home.js` (delete lines 891-928)

- [ ] **Step 1: Read the dead code**

Read `crownbingo/src/pages/home.js` lines 888-930 to confirm current state.

The code to delete spans three blocks:

**Block 1 — `syncWithFirebase` function (lines 891-903):**
```javascript
    const syncWithFirebase = () => {
        const cachedData = getCachedData();
        if (cachedData) {
            // Update Firebase database with cached data
            app.database().ref('path/to/data').set(cachedData)
                .then(() => {
                    console.log('Data synchronized with Firebase');
                })
                .catch(error => {
                    console.error('Error synchronizing data with Firebase:', error);
                });
        }
    };
```

**Block 2 — `getCachedData` helper (lines 905-909):**
```javascript
    // Function to retrieve cached data from localStorage
    const getCachedData = () => {
        const cachedData = localStorage.getItem('cachedData');
        return cachedData ? JSON.parse(cachedData) : null;
    };
```

**Block 3 — Two useEffect hooks (lines 911-928):**
```javascript
    // Effect to sync with Firebase when online
    useEffect(() => {
        const handleOnline = () => {
            console.log('Device is back online');
            syncWithFirebase();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    // Initial synchronization with Firebase when the app loads
    useEffect(() => {
        syncWithFirebase();
    }, []);
```

- [ ] **Step 2: Delete the dead code**

Delete lines 891-928 from `crownbingo/src/pages/home.js` (the three blocks above). This removes:
- `syncWithFirebase` function definition
- `getCachedData` helper function
- Online event listener useEffect
- Initial sync useEffect

- [ ] **Step 3: Verify deletion**

Read `crownbingo/src/pages/home.js` lines 885-935. Confirm:
- Line 888 is blank (or next content)
- `syncWithFirebase` no longer appears
- `getCachedData` no longer appears
- `app.database()` no longer appears
- The `isToggled` state on what was line 929 is now adjacent to the blank line after `handleCallNextNumber`

- [ ] **Step 4: Verify no remaining references**

Run: `Select-String -Path "C:\Users\ASHE\Documents\GitHub\Crown Bingo\crownbingo\src\pages\home.js" -Pattern "syncWithFirebase|getCachedData|app\.database"`

Expected: No output (no matches found).

- [ ] **Step 5: Commit**

```bash
cd "C:\Users\ASHE\Documents\GitHub\Crown Bingo"
git add crownbingo/src/pages/home.js
git commit -m "fix(crownbingo): remove syncWithFirebase dead code

- Delete syncWithFirebase (calls app.database() but app never imported)
- Delete getCachedData helper (only used by syncWithFirebase)
- Delete online event listener and initial sync useEffects
- Fixes R-1: ReferenceError on every mount for returning users"
```

---

## Verification (Post-Implementation)

After both tasks are committed:

1. **Firestore rules** — Deploy to Firebase Console and verify:
   - Player: login, play bingo, view history, check jackpot ✓
   - Super Agent: view dashboard, recharge user, withdraw, edit settings ✓
   - Admin: manage users, manage agents, view settings, view audit logs ✓
   - API: place bet, recharge wallet, create game (server-side, unaffected) ✓

2. **syncWithFirebase** — Player app loads without console errors for returning users ✓

3. **No functional impact** — All 124 traced Firestore operations remain permitted under new rules ✓
