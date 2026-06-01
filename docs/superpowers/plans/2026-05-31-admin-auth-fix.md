# Admin Auth Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align admin auth claims (`claims.admin` → `claims.role === 'SUPER_ADMIN'`) and deploy firestore.rules so the admin dashboard displays real data.

**Architecture:** Single Firebase project (Name: `bingo-27d37`, ID: `bingo-27d37-5661f`). Admin panel already points to the correct project — only claim key names were wrong. No config swap needed.

**Tech Stack:** Firebase JS SDK v12, React 18, MUI 5, Node.js (admin script)

---

### Task 1: Update admin-panel/src/firebase.js config

**Files:**
- Modify: `admin-panel/src/firebase.js:9-17`

- [ ] **Step 1: Swap Firebase config to bingo-27d37**

Replace lines 9-17 with the `bingo-27d37` config:

```js
const firebaseConfig = {
    apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
    authDomain: "bingo-27d37.firebaseapp.com",
    projectId: "bingo-27d37",
    storageBucket: "bingo-27d37.firebasestorage.app",
    messagingSenderId: "509582453061",
    appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: "G-VTLQ243Q66"
};
```

- [ ] **Step 2: Verify no other dependencies break**

Run: `cd admin-panel && npm install 2>&1 | Select-String -Pattern "ERR!"`
Expected: No output (or only warnings, not errors)

---

### Task 2: Update admin-panel/src/App.js auth claim check

**Files:**
- Modify: `admin-panel/src/App.js:67`

- [ ] **Step 1: Change claim check**

Change line 67 from:
```js
setIsAdmin(token.claims.admin === true);
```
to:
```js
setIsAdmin(token.claims.role === 'SUPER_ADMIN');
```

- [ ] **Step 2: Verify build**

Run: `cd admin-panel && npm run build 2>&1 | Select-String -Pattern "Failed|Error"`
Expected: Build succeeds (may succeed or need full `npm install` first)

---

### Task 3: Update admin-panel/admin.html config + claim check

**Files:**
- Modify: `admin-panel/admin.html:825-833` (config)
- Modify: `admin-panel/admin.html:879` (claim check)

- [ ] **Step 1: Swap Firebase config**

Replace lines 825-833:
```js
const firebaseConfig = {
    apiKey: "AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do",
    authDomain: "bingo-27d37-5661f.firebaseapp.com",
    projectId: "bingo-27d37-5661f",
    storageBucket: "bingo-27d37-5661f.firebasestorage.app",
    messagingSenderId: "330815222659",
    appId: "1:330815222659:web:4890bf5cddc728bf29bcb6",
    measurementId: "G-CD4DWDC8SW"
};
```
with:
```js
const firebaseConfig = {
    apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
    authDomain: "bingo-27d37.firebaseapp.com",
    projectId: "bingo-27d37",
    storageBucket: "bingo-27d37.firebasestorage.app",
    messagingSenderId: "509582453061",
    appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: "G-VTLQ243Q66"
};
```

- [ ] **Step 2: Change claim check**

Line 879:
```js
if (token.claims.admin === true) {
```
to:
```js
if (token.claims.role === 'SUPER_ADMIN') {
```

---

### Task 4: Update setAdminClaim.js

**Files:**
- Modify: `admin-panel/setAdminClaim.js:21`
- Modify: `admin-panel/setAdminClaim.js:53`

- [ ] **Step 1: Update project reference link**

Line 21:
```js
console.error('1. Go to https://console.firebase.google.com/project/bingo-27d37-5661f/settings/serviceaccounts/adminsdk');
```
to:
```js
console.error('1. Go to https://console.firebase.google.com/project/bingo-27d37/settings/serviceaccounts/adminsdk');
```

- [ ] **Step 2: Change claim key**

Line 53:
```js
await auth.setCustomUserClaims(user.uid, { admin: true });
```
to:
```js
await auth.setCustomUserClaims(user.uid, { role: 'SUPER_ADMIN' });
```

- [ ] **Step 3: Update admin panel URL (optional)**

Line 65:
```js
console.error(`1. Go to https://console.firebase.google.com/project/bingo-27d37-5661f/authentication/users`);
```
to:
```js
console.error(`1. Go to https://console.firebase.google.com/project/bingo-27d37/authentication/users`);
```

---

### Task 5: Deploy firestore.rules to bingo-27d37

**Files:**
- Reference: `firestore.rules` (root — already has correct SUPER_ADMIN/SUPER_AGENT/USER role checks)

- [ ] **Step 1: Open Firebase Console**

Navigate to https://console.firebase.google.com/project/bingo-27d37/firestore/rules

- [ ] **Step 2: Copy current rules**

Copy the contents of `firestore.rules` from the project root.

- [ ] **Step 3: Paste and publish**

Paste into the Firebase Console Firestore Rules editor, click **Publish**.

---

### Task 6: Set admin custom claim

**Files:**
- Reference: `admin-panel/setAdminClaim.js`

- [ ] **Step 1: Download service account key**

Go to https://console.firebase.google.com/project/bingo-27d37/settings/serviceaccounts/adminsdk
Click "Generate new private key"
Save as `admin-panel/serviceAccountKey.json`

- [ ] **Step 2: Run the script**

```powershell
cd admin-panel
node setAdminClaim.js
```

Expected output:
```
✅ Firebase Admin SDK initialized
📧 Setting admin claim for: admin@crownbingo.com
✅ Found user: <uid>
✅ Custom claim set successfully!
✨ User admin@crownbingo.com is now an admin!
📋 Custom Claims: { role: 'SUPER_ADMIN' }
```

---

### Task 7: Verify admin panel works

- [ ] **Step 1: Start admin panel**

```powershell
cd admin-panel
npm start
```
or use the Python HTTP server.

- [ ] **Step 2: Login as admin**

Navigate to `/admin-login`, sign in with `admin@crownbingo.com` / `AdminPassword123!`

- [ ] **Step 3: Verify dashboard**

Check that Total Users, Active Users, Total Agents, Total Bets show non-zero values (reflecting real data from `bingo-27d37`).

- [ ] **Step 4: Verify User Management**

Navigate to Users page — user list should be populated with real user data.
