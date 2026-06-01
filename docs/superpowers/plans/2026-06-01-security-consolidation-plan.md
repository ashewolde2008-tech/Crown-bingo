# Security Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate Firebase projects, add an API layer for financial operations, implement audit logging, and fix critical security gaps across the Crown Bingo system.

**Architecture:** A lightweight Node.js/Express API handles 4 security-critical operations (create user, transfer points, recharge wallet, disable/enable user) using Firebase Admin SDK with `runTransaction` and server-side audit logging. Admin panel consolidates from 2 Firebase projects to 1. Super agent app gets logout, deduplicated config, and API routing for financial ops.

**Tech Stack:** Node.js 18+, Express, Firebase Admin SDK, Render.com (free tier), React 18, Firebase Auth/Firestore.

> **Important:** `superagentcrownbingo` is pre-built — the browser loads the compiled bundle `main.d2281d5f.js`, not the source files in `static/js/`. Modifying source files requires setting up a build pipeline (Task 4a) and running a build before changes take effect. The source files in `static/js/` are what we modify; the build output replaces the bundle.

---

## File Structure

```
C:\Users\ASHE\Documents\Crown Bingo\
├── api/                                          # NEW - API layer
│   ├── package.json
│   ├── .env.example
│   ├── server.js                                 # Express app entry
│   ├── middleware/
│   │   └── auth.js                               # Firebase token verify + role check
│   ├── routes/
│   │   ├── users.js                              # POST /api/users
│   │   ├── points.js                             # POST /api/points/transfer
│   │   ├── wallet.js                             # POST /api/wallet/recharge
│   │   └── status.js                             # PATCH /api/users/:uid/status
│   └── services/
│       └── audit.js                              # Audit log writer
│
├── admin-panel/
│   └── src/
│       ├── firebase.js                           # MODIFIED - single project config
│       ├── authStore.js                          # DELETED
│       ├── services/
│       │   └── api.js                            # NEW - API client helper
│       └── components/
│           └── pages/
│               ├── UserManagement.js             # MODIFIED - create via API
│               └── AgentManagement.js            # MODIFIED - create via API
│
├── superagentcrownbingo/
│   ├── src/                                       # AFTER Task 4 file move
│   │   ├── firebase.js                           # NEW - shared config
│   │   ├── Components/
│   │   │   ├── login.js                          # MODIFIED - use shared firebase
│   │   │   ├── Dashboard.js                      # MODIFIED - add logout
│   │   │   ├── DashboardTable.js                 # MODIFIED - point transfer via API
│   │   │   └── fragments/
│   │   │       ├── AddUserDialog.js              # MODIFIED - use shared firebase
│   │   │       ├── AddSubAgentDialog.js          # MODIFIED - use shared firebase
│   │   │       ├── EditDialog.js                 # MODIFIED - point transfer via API
│   │   │       ├── userDetailsTable.js           # MODIFIED - point transfer via API
│   │   │       ├── userDetails.js                # MODIFIED - point transfer via API
│   │   │       ├── settingPage.js                # MODIFIED - use shared firebase
│   │   │       └── Cards.js                      # MODIFIED - fix Title import
│   │   └── index.js                              # Entry point (from pre-built source)
│   ├── public/
│   │   └── index.html                            # NEW - CRA HTML template
│   └── package.json                              # NEW - build deps
```

---

### Task 1: Create API Layer Project Structure

**Files:**
- Create: `api/package.json`
- Create: `api/.env.example`
- Create: `api/server.js`
- Create: `api/middleware/auth.js`
- Create: `api/services/audit.js`
- Create: `api/routes/users.js`
- Create: `api/routes/points.js`
- Create: `api/routes/wallet.js`
- Create: `api/routes/status.js`

- [ ] **Step 1: Create api/package.json**

```json
{
  "name": "crown-bingo-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "firebase-admin": "^11.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

- [ ] **Step 2: Create api/.env.example**

```
PORT=5000
FIREBASE_PROJECT_ID=bingo-27d37
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

- [ ] **Step 3: Create api/middleware/auth.js**

```javascript
const admin = require('firebase-admin');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Token expired or invalid' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user.role || req.user.custom_claims?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: `Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
```

- [ ] **Step 4: Create api/services/audit.js**

```javascript
const admin = require('firebase-admin');

async function writeAuditLog({ action, actor, target, details, result, error, ip, source }) {
  const db = admin.firestore();
  await db.collection('auditLogs').add({
    action,
    actor,
    target,
    details,
    result,
    error: error || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: ip || null,
    source: source || 'api'
  });
}

module.exports = { writeAuditLog };
```

- [ ] **Step 5: Create api/routes/users.js**

```javascript
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { email, password, username, phone, initialBalance, role } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const db = admin.firestore();
    const targetCollection = role === 'agent' ? 'agents' : 'users';
    const docData = {
      uid: userRecord.uid,
      email,
      username: username || '',
      phone: phone || '',
      balance: initialBalance || 0,
      isActive: true,
      isDisabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };
    if (role === 'agent') {
      docData.agentCode = req.body.agentCode || '';
      docData.commissionRate = req.body.commissionRate || 5;
      docData.totalSales = 0;
      docData.totalEarnings = 0;
    }
    await db.collection(targetCollection).doc(userRecord.uid).set(docData);

    await writeAuditLog({
      action: role === 'agent' ? 'AGENT_CREATED' : 'USER_CREATED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userRecord.uid, email },
      details: { role, initialBalance },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.status(201).json({ success: true, data: { uid: userRecord.uid, ...docData } });
  } catch (err) {
    await writeAuditLog({
      action: role === 'agent' ? 'AGENT_CREATED' : 'USER_CREATED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: null, email },
      details: { role, initialBalance },
      result: 'FAILURE',
      error: err.message,
      ip: req.ip,
      source: 'api'
    }).catch(() => {});
    res.status(500).json({ success: false, error: err.code || 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 6: Create api/routes/points.js**

```javascript
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/transfer', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { userId, amount, percent } = req.body;
  const db = admin.firestore();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const adminRef = db.collection('points').doc(req.user.uid);
      const userRef = db.collection('points').doc(userId);
      const adminSnap = await transaction.get(adminRef);
      const userSnap = await transaction.get(userRef);

      const adminPoints = adminSnap.exists ? (adminSnap.data().points || 0) : 0;
      const userPoints = userSnap.exists ? (userSnap.data().points || 0) : 0;

      if (percent <= 0) throw new Error('Percent must be greater than 0');
      const requiredFromAdmin = Math.ceil((Number(amount) * 100) / Number(percent));
      if (adminPoints < requiredFromAdmin) throw new Error('Insufficient admin points');

      const newUserPoints = userPoints + requiredFromAdmin;
      const newAdminPoints = adminPoints - requiredFromAdmin;

      transaction.set(userRef, { points: newUserPoints, percent: Number(percent), uid: userId, casher_percent: 20 }, { merge: true });
      transaction.set(adminRef, { points: newAdminPoints, uid: req.user.uid }, { merge: true });

      return { balanceBefore: { admin: adminPoints, user: userPoints }, balanceAfter: { admin: newAdminPoints, user: newUserPoints }, transferredAmount: requiredFromAdmin };
    });

    await db.collection('history').add({
      userId,
      adminId: req.user.uid,
      userName: req.body.userName || '',
      pointsAdded: Number(amount),
      percent: Number(percent),
      date: admin.firestore.FieldValue.serverTimestamp()
    });

    await writeAuditLog({
      action: 'POINTS_TRANSFERRED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId, email: req.body.userEmail || '' },
      details: { amount: Number(amount), percent: Number(percent), ...result },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.json({ success: true, data: result });
  } catch (err) {
    await writeAuditLog({
      action: 'POINTS_TRANSFERRED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId, email: req.body.userEmail || '' },
      details: { amount: Number(amount), percent: Number(percent) },
      result: 'FAILURE',
      error: err.message,
      ip: req.ip,
      source: 'api'
    }).catch(() => {});
    res.status(400).json({ success: false, error: 'TRANSFER_FAILED', message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 7: Create api/routes/wallet.js**

```javascript
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/recharge', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { userId, amount, description } = req.body;
  const db = admin.firestore();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error('User not found');

      const userData = userSnap.data();
      const balanceBefore = userData.balance || 0;
      const balanceAfter = balanceBefore + Number(amount);

      transaction.update(userRef, { balance: balanceAfter, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

      const txnRef = db.collection('transactions').doc();
      transaction.set(txnRef, {
        userId,
        type: 'RECHARGE',
        amount: Number(amount),
        balanceBefore,
        balanceAfter,
        description: description || 'Wallet recharge',
        agentId: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'COMPLETED'
      });

      return { balanceBefore, balanceAfter };
    });

    await writeAuditLog({
      action: 'WALLET_RECHARGED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId },
      details: { amount: Number(amount), ...result },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.json({ success: true, data: result });
  } catch (err) {
    await writeAuditLog({
      action: 'WALLET_RECHARGED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid: userId },
      details: { amount: Number(amount) },
      result: 'FAILURE',
      error: err.message,
      ip: req.ip,
      source: 'api'
    }).catch(() => {});
    res.status(400).json({ success: false, error: 'RECHARGE_FAILED', message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 8: Create api/routes/status.js**

```javascript
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');

router.patch('/:uid/status', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const { uid } = req.params;
  const { disabled, reason } = req.body;
  const db = admin.firestore();

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });

    const updateData = {
      isDisabled: !!disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (disabled) {
      updateData.disabledReason = reason || 'Account suspended by admin';
      updateData.disabledAt = admin.firestore.FieldValue.serverTimestamp();
    } else {
      updateData.disabledReason = null;
      updateData.disabledAt = null;
    }

    await userRef.update(updateData);

    await writeAuditLog({
      action: disabled ? 'USER_DISABLED' : 'USER_ENABLED',
      actor: { uid: req.user.uid, email: req.user.email, role: req.user.role },
      target: { uid, email: userSnap.data().email || '' },
      details: { reason: updateData.disabledReason },
      result: 'SUCCESS',
      ip: req.ip,
      source: 'api'
    });

    res.json({ success: true, data: { uid, ...updateData } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 9: Create api/server.js**

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'bingo-27d37'
});

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/points', require('./routes/points'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/users', require('./routes/status'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Crown Bingo API running on port ${PORT}`));
```

- [ ] **Step 10: Install API dependencies and verify startup**

Run: `cd api && npm install`

Run: `node -e "require('./server.js')"` and confirm no errors (will fail on Firebase Admin SDK without credentials locally — expected).

- [ ] **Step 11: Commit API layer**

```bash
git add api/
git commit -m "feat: add API layer for financial operations with audit logging"
```

---

### Task 2: Create API Client in Admin Panel

**Files:**
- Create: `admin-panel/src/services/api.js`
- Modify: `admin-panel/src/services/firebase.js`

- [ ] **Step 1: Create admin-panel/src/services/api.js**

```javascript
import { getAuth } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function apiPost(endpoint, data) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

async function apiPatch(endpoint, data) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

export { apiPost, apiPatch };
```

- [ ] **Step 2: Verify api.js imports correctly**

Run: `cd admin-panel && npx eslint src/services/api.js` or visually confirm no syntax errors.

- [ ] **Step 3: Commit**

```bash
git add admin-panel/src/services/api.js
git commit -m "feat: add API client helper for admin panel"
```

---

### Task 3: Consolidate Admin Panel Firebase Config

**Files:**
- Modify: `admin-panel/src/firebase.js`
- Delete: `admin-panel/src/authStore.js`
- Modify: `admin-panel/src/components/pages/UserManagement.js`
- Modify: `admin-panel/src/components/pages/AgentManagement.js`

- [ ] **Step 1: Read current firebase.js**

Read `admin-panel/src/firebase.js` to understand the current dual-project setup.

- [ ] **Step 2: Rewrite admin-panel/src/firebase.js to single project**

Replace entire file with:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
  authDomain: "bingo-27d37.firebaseapp.com",
  projectId: "bingo-27d37",
  storageBucket: "bingo-27d37.firebasestorage.app",
  messagingSenderId: "509582453061",
  appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
  measurementId: "G-VTLQ243Q66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* analytics unavailable */ }

async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

async function logoutUser() {
  await signOut(auth);
}

function setupAuthListener(callback) {
  return onAuthStateChanged(auth, callback);
}

async function isUserAdmin(user) {
  if (!user) return false;
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.role === 'SUPER_ADMIN';
}

async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addUser(userData) {
  const ref = doc(db, 'users', userData.uid);
  await setDoc(ref, userData);
}

async function updateUser(userId, userData) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, userData);
}

async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}

async function getAllAgents() {
  const snapshot = await getDocs(collection(db, 'agents'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addAgent(agentData) {
  const ref = doc(db, 'agents', agentData.uid);
  await setDoc(ref, agentData);
}

async function updateAgent(agentId, agentData) {
  const ref = doc(db, 'agents', agentId);
  await updateDoc(ref, agentData);
}

async function deleteAgent(agentId) {
  await deleteDoc(doc(db, 'agents', agentId));
}

async function getSettings() {
  const snapshot = await getDocs(collection(db, 'settings'));
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function updateSettings(settingsData) {
  const ref = doc(db, 'settings', 'config');
  await setDoc(ref, settingsData, { merge: true });
}

export {
  auth, db, storage, analytics,
  loginUser, logoutUser, setupAuthListener, isUserAdmin,
  getAllUsers, addUser, updateUser, deleteUser,
  getAllAgents, addAgent, updateAgent, deleteAgent,
  getSettings, updateSettings,
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where
};
```

- [ ] **Step 3: Delete admin-panel/src/authStore.js**

Run: `Remove-Item -LiteralPath "admin-panel\src\authStore.js"`

- [ ] **Step 4: Modify UserManagement.js**

Read `admin-panel/src/components/pages/UserManagement.js`. Replace the user creation logic to:

1. Remove `import { authStore }` and `crownbingoAuth` references
2. Replace the create user handler with a call to the API:

```javascript
// Replace the handleCreateUser/dialog submit logic:
// Instead of:
//   const userCred = await createUserWithEmailAndPassword(crownbingoAuth, values.email, values.password);
//   ...
//   await signInWithEmailAndPassword(auth, adminCreds.email, adminCreds.password);
// Use:
import { apiPost } from '../../services/api';

// Inside the form submission handler:
const result = await apiPost('/api/users', {
  email: values.email,
  password: values.password,
  username: values.username,
  phone: values.phone || '',
  initialBalance: Number(values.balance) || 0,
  role: 'user'
});
// Then refresh the user list:
const users = await getAllUsers();
setUsers(users);
```

- [ ] **Step 5: Modify AgentManagement.js**

Read `admin-panel/src/components/pages/AgentManagement.js`. Replace the agent creation logic with:

```javascript
import { apiPost } from '../../services/api';

// Inside the form submission handler:
const result = await apiPost('/api/users', {
  email: values.email,
  password: values.password,
  username: values.agentName,
  phone: values.phone || '',
  initialBalance: 0,
  role: 'agent',
  agentCode: values.agentCode,
  commissionRate: Number(values.commissionRate) || 5
});
// Then refresh:
const agents = await getAllAgents();
setAgents(agents);
```

- [ ] **Step 6: Commit**

```bash
git add admin-panel/src/firebase.js admin-panel/src/components/pages/UserManagement.js admin-panel/src/components/pages/AgentManagement.js
git rm admin-panel/src/authStore.js
git commit -m "refactor: consolidate to single Firebase project, route creates through API"
```

---

### Task 4: Set Up Super Agent App Build Pipeline

**Files:**
- Create: `superagentcrownbingo/package.json`
- Modify: `superagentcrownbingo/index.html` (check if build output path needs updating)

The superagentcrownbingo source files use JSX and ES module imports (`import React from 'react'`, `import { ... } from 'firebase/auth'`) which require a bundler (webpack/CRA) to run in the browser.

- [ ] **Step 1: Create superagentcrownbingo/package.json**

```json
{
  "name": "superagentcrownbingo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "@mui/material": "^5.11.0",
    "@mui/icons-material": "^5.11.0",
    "@mui/x-date-pickers": "^6.0.0",
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "firebase": "^10.0.0",
    "react-toastify": "^9.1.1",
    "react-chartjs-2": "^4.3.1",
    "chart.js": "^3.9.1",
    "dayjs": "^1.11.0",
    "web-vitals": "^2.1.0"
  },
  "browserslist": { "production": [">0.2%", "not dead", "not op_mini all"], "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"] }
}
```

- [ ] **Step 2: Create superagentcrownbingo/public/index.html**

Create a minimal HTML entry for CRA build. The root `index.html` currently loads `main.d2281d5f.js`; this new one lets CRA generate its own bundle references.

```bash
New-Item -ItemType Directory -Path "superagentcrownbingo\public" -Force
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Super Agent Crown Bingo</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

- [ ] **Step 3: Create superagentcrownbingo/src/ directory and move source files**

```bash
mkdir superagentcrownbingo\src
Move-Item -LiteralPath "superagentcrownbingo\static\js\*" -Destination "superagentcrownbingo\src\" -Force
```

- [ ] **Step 4: Test that build works**

```bash
cd superagentcrownbingo
npm install
npm run build
```

Expected: Build succeeds, output in `build/` directory.

- [ ] **Step 5: Update Netlify config to point to build**

If `netlify.toml` exists, update publish directory to `build`.

- [ ] **Step 6: Commit**

```bash
git add superagentcrownbingo/
git commit -m "chore: set up build pipeline for super agent app"
```

---

### Task 5: Add Logout to Super Agent App

**Files:**
- Modify: `superagentcrownbingo/src/Components/Dashboard.js`

- [ ] **Step 1: Read Dashboard.js**

Read `superagentcrownbingo/src/Components/Dashboard.js` to understand the layout and where to add a logout button.

- [ ] **Step 2: Add logout button**

Add a logout button in the sidebar or AppBar. Look for the drawer/navigation section and add:

```javascript
// After the existing list items, add:
<MenuItem onClick={handleLogout}>
  <ListItemIcon><LogoutIcon /></ListItemIcon>
  <ListItemText primary="Logout" />
</MenuItem>

// Add handler:
function handleLogout() {
  signOut(auth).then(() => {
    localStorage.clear();
    window.location.hash = '#/';
  });
}

// Ensure imports at top:
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import LogoutIcon from '@mui/icons-material/Logout';
```

- [ ] **Step 3: Rebuild and verify**

```bash
cd superagentcrownbingo
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add superagentcrownbingo/
git commit -m "fix: add logout button to super agent dashboard"
```

---

### Task 6: Deduplicate Firebase Config in Super Agent App

**Files:**
- Create: `superagentcrownbingo/src/firebase.js` (if not already moved)
- Modify: `superagentcrownbingo/src/Components/login.js`
- Modify: `superagentcrownbingo/src/Components/fragments/AddUserDialog.js`
- Modify: `superagentcrownbingo/src/Components/fragments/AddSubAgentDialog.js`
- Modify: `superagentcrownbingo/src/Components/fragments/settingPage.js`

- [ ] **Step 1: Read current config from one file**

Read `login.js` to extract the current Firebase config and identify all duplicate instances.

- [ ] **Step 2: Ensure firebase.js exists in src/**

After Task 4's file move, there should be a `superagentcrownbingo/src/firebase.js`. Verify it exists. If not, create:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
  authDomain: "bingo-27d37.firebaseapp.com",
  projectId: "bingo-27d37",
  storageBucket: "bingo-27d37.firebasestorage.app",
  messagingSenderId: "509582453061",
  appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
  measurementId: "G-VTLQ243Q66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* unavailable */ }

export { auth, db, analytics };
```

- [ ] **Step 3: Update login.js**

Remove the duplicate Firebase config block. Add at top:

```javascript
import { auth, db } from '../firebase';
```

Remove all `initializeApp`, `getAuth`, `getFirestore` calls and inline config object from this file.

- [ ] **Step 4: Update AddUserDialog.js**

File is at `src/Components/fragments/AddUserDialog.js` — remove inline Firebase config, add:

```javascript
import { auth, db } from '../../firebase';
```

- [ ] **Step 5: Update AddSubAgentDialog.js**

Same pattern as AddUserDialog — remove inline Firebase config, add `import { auth, db } from '../../firebase'`.

- [ ] **Step 6: Update settingPage.js**

File is at `src/Components/fragments/settingPage.js` — remove inline Firebase config, add `import { auth, db } from '../../firebase'`.

- [ ] **Step 7: Rebuild and verify**

```bash
cd superagentcrownbingo
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add superagentcrownbingo/
git commit -m "refactor: deduplicate Firebase config in super agent app"
```

---

### Task 7: Fix Title Import in Cards.js

**Files:**
- Modify: `superagentcrownbingo/src/Components/fragments/Cards.js`

- [ ] **Step 1: Read Cards.js**

Read the current `Cards.js` to see the broken import.

- [ ] **Step 2: Fix the import**

Remove or replace the broken import. If `Title` is used in the file, define it inline:

```javascript
// Replace: import Title from '../../Title';
// With (if Title is MUI Typography):
import Typography from '@mui/material/Typography';
// Then use <Typography variant="h6"> instead of <Title>
```

Or simply remove the import if `Title` isn't actually used (check usage).

- [ ] **Step 3: Rebuild and verify**

```bash
cd superagentcrownbingo
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add superagentcrownbingo/
git commit -m "fix: remove broken Title import in Cards.js"
```

---

### Task 8: Route Super Agent Point Transfers Through API

**Files:**
- Modify: `superagentcrownbingo/src/Components/fragments/EditDialog.js`
- Modify: `superagentcrownbingo/src/Components/fragments/userDetailsTable.js`
- Modify: `superagentcrownbingo/src/Components/fragments/userDetails.js`
- Modify: `superagentcrownbingo/src/Components/DashboardTable.js`

- [ ] **Step 1: Read EditDialog.js**

Read `superagentcrownbingo/src/Components/fragments/EditDialog.js` for the current point transfer logic.

- [ ] **Step 2: Modify EditDialog.js to use API**

Replace the direct Firestore point transfer with an API call:

```javascript
// At top:
import { auth } from '../../firebase';

// Replace the transfer logic:
async function handleTransfer() {
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('http://localhost:5000/api/points/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        userId: user.uid,
        amount: Number(points),
        percent: Number(percent),
        userName: user.userName || user.email
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    toast.success('Points transferred successfully');
    handleClose();
  } catch (err) {
    toast.error(err.message);
  }
}
```

- [ ] **Step 3: Modify userDetails.js + userDetailsTable.js**

Same pattern — replace point transfer logic with API call to `POST /api/points/transfer`. Remove the `runTransaction` code and replace with the fetch pattern above. Import `auth` from `../../firebase`.

- [ ] **Step 4: Modify DashboardTable.js**

If `DashboardTable.js` has its own point transfer logic (the non-transactional two-step path), remove it. The EditDialog already routes through the API.

- [ ] **Step 5: Rebuild and verify**

```bash
cd superagentcrownbingo
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add superagentcrownbingo/
git commit -m "refactor: route all super agent point transfers through API"
```

---

### Task 9: Add Audit Log Viewer to Admin Panel

**Files:**
- Modify: `admin-panel/src/components/pages/Settings.js` or create new page

- [ ] **Step 1: Add audit log viewer to Settings page**

Append a collapsible section to the Settings page or add a new "Audit Logs" card:

```javascript
import { collection, getDocs, query, orderBy, limit, db } from '../../firebase';

// In the Settings component, add:
const [auditLogs, setAuditLogs] = useState([]);
const [loadingLogs, setLoadingLogs] = useState(false);

async function loadAuditLogs() {
  setLoadingLogs(true);
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    setAuditLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('Failed to load audit logs:', err);
  }
  setLoadingLogs(false);
}

useEffect(() => { loadAuditLogs(); }, []);

// Render a table with columns: Action, Actor, Target, Details, Timestamp, Result
```

- [ ] **Step 2: Commit**

```bash
git add admin-panel/src/components/pages/Settings.js
git commit -m "feat: add audit log viewer to admin panel settings"
```

---

### Task 10: Deploy API to Render

**Files:**
- Create: `api/Dockerfile` (optional, Render supports Node.js natively)

- [ ] **Step 1: Create Render service**

1. Push the `api/` directory to a new GitHub repo (or include in existing monorepo)
2. In Render Dashboard: "New Web Service"
3. Connect repo, set:
   - **Name:** `crown-bingo-api`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. Add environment variable: `FIREBASE_PROJECT_ID = bingo-27d37`
5. Generate and add Firebase Admin SDK service account key:
   - Firebase Console → Project Settings → Service accounts → Generate new private key
   - Set as `GOOGLE_APPLICATION_CREDENTIALS` or paste JSON content into env var

- [ ] **Step 2: Update API_BASE in admin panel**

Update `.env` or the default in `api.js`:

```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'https://crown-bingo-api.onrender.com';
```

- [ ] **Step 3: Commit config updates**

```bash
git add admin-panel/src/services/api.js
git commit -m "chore: update API URL to production Render URL"
```

---

### Task 11: Verify End-to-End

- [ ] **Step 1: Verify Firebase consolidation**

1. Start admin panel: `cd admin-panel && npm start`
2. Login with admin credentials
3. Create a test user — confirm no re-auth needed, user appears in `bingo-27d37` Firestore
4. Verify `authStore.js` is gone (no reference errors in console)

- [ ] **Step 2: Verify API operations**

1. Start API: `cd api && node server.js`
2. Test health: `curl http://localhost:5000/health` → `{"status":"ok"}`
3. Test user creation: `curl -X POST http://localhost:5000/api/users -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"Test123!","username":"test","role":"user"}'`
4. Test points transfer: `curl -X POST http://localhost:5000/api/points/transfer ...`
5. Test wallet recharge: `curl -X POST http://localhost:5000/api/wallet/recharge ...`
6. Test status change: `curl -X PATCH http://localhost:5000/api/users/<uid>/status -d '{"disabled":true}'`
7. Verify audit log documents created in Firestore `auditLogs` collection

- [ ] **Step 3: Verify super agent fixes**

1. Start super agent app
2. Confirm logout button exists and works
3. Confirm point transfer works via API (not direct Firestore)
4. Confirm no Firebase config errors in console

- [ ] **Step 4: Run build**

```bash
cd admin-panel && npm run build
```
Confirm no errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: complete security consolidation"
```
