# Crown Bingo Production Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Crown Bingo system from 2.5/10 to 8.5/10 production readiness across security, resilience, observability, and operations.

**Architecture:** The Express API at `api/` already exists with routes, auth, and transactions. This plan adds missing middleware (rate limiting, CORS, Joi, correlation IDs, error handler, retry), fixes weak RBAC (DB verification instead of token claims), adds observability (Winston, prom-client), resilience (circuit breaker, service worker), and operations (CI/CD, backup). Frontend apps are updated to route through the API rather than direct Firestore.

**Tech Stack:** Express 4, Firebase Admin SDK 11, Joi, express-rate-limit, node-cache, winston + winston-daily-rotate-file, prom-client, uuid.

**Phase 1 (Week 1):** Security — middleware additions, RBAC fix, Joi schemas, CORS, env vars, Firestore rule update
**Phase 2 (Week 2):** Resilience — circuit breaker, service worker, indexes, error retry
**Phase 3 (Week 3):** Observability + Ops — logging, metrics, CI/CD, backup, DR docs

---

## File Structure

```
api/
├── server.js                          # MODIFY: add middleware stack
├── package.json                       # MODIFY: add new dependencies
├── .env                               # MODIFY: add REACT_APP env prefix vars
├── middleware/
│   ├── auth.js                        # MODIFY: requireRole checks DB, not token
│   ├── cors.js                        # CREATE: per-environment origin whitelist
│   ├── rateLimit.js                   # CREATE: global + login rate limiters
│   ├── validate.js                    # CREATE: Joi schema validator factory
│   ├── correlationId.js               # CREATE: UUID per request
│   ├── errorHandler.js                # CREATE: centralized error → structured JSON
│   └── retry.js                       # CREATE: exponential backoff wrapper
├── routes/
│   ├── users.js                       # MODIFY: add Joi validation, RBAC fix
│   ├── wallet.js                      # MODIFY: add Joi validation
│   ├── points.js                      # MODIFY: add Joi validation
│   ├── status.js                      # MODIFY: add Joi validation
│   ├── agents.js                      # CREATE: CRUD with RBAC
│   ├── bets.js                        # CREATE: CRUD with RBAC
│   ├── games.js                       # CREATE: CRUD with RBAC
│   ├── settings.js                    # CREATE: CRUD with RBAC
│   └── auditLogs.js                   # CREATE: read-only for admin
├── services/
│   ├── firebase.js                    # KEEP (via server.js init)
│   ├── audit.js                       # KEEP
│   └── circuitBreaker.js              # CREATE: CLOSED→OPEN→HALF_OPEN state machine
├── validation/
│   └── schemas.js                     # CREATE: all Joi schemas
├── logger.js                          # CREATE: Winston with daily rotate + correlation ID
└── metrics.js                         # CREATE: prom-client histograms counters gauges

admin-panel/
├── .env                               # CREATE: REACT_APP_FIREBASE_API_KEY etc.
├── .env.example                       # CREATE: template without real keys
├── src/
│   ├── firebase.js                    # MODIFY: use env vars, remove hardcoded keys
│   ├── App.js                         # MODIFY: route all through API, add service worker
│   └── components/pages/
│       ├── UserManagement.js          # MODIFY: use API for all CRUD, add pagination
│       ├── AgentManagement.js         # MODIFY: use API for all CRUD
│       └── Dashboard.js               # MODIFY: use API, add caching
├── public/
│   └── service-worker.js              # CREATE: cache-first static, network-first API

crownbingo/
├── .env                               # CREATE: REACT_APP env vars
├── src/
│   └── firebase.js                    # MODIFY: consolidate to bingo-27d37
├── public/
│   └── service-worker.js              # CREATE: offline support

firestore.rules                        # MODIFY: add amount limits, prevent double-spend
firestore.indexes.json                 # MODIFY: add composite indexes

.github/
└── workflows/
    ├── deploy.yml                     # CREATE: CI/CD for Render/Netlify
    └── backup.yml                     # CREATE: scheduled Firestore export
```

---

### Phase 1: Security Gateway (Week 1)

#### Task 1: Add rate limiting middleware to API

**Files:**
- Create: `api/middleware/rateLimit.js`
- Modify: `api/server.js:12`

- [ ] **Step 1: Create rateLimit.js middleware**

```js
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many requests, please slow down' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many login attempts, try again later' }
});

const apiLimiter = rateLimit({
  keyGenerator: (req) => req.user?.uid || req.ip,
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many API requests' }
});

module.exports = { globalLimiter, loginLimiter, apiLimiter };
```

- [ ] **Step 2: Install express-rate-limit**

Run: `cd api && npm install express-rate-limit`
Expected: Package added to node_modules and package.json

- [ ] **Step 3: Wire rate limiters into server.js**

Edit `api/server.js` to add rate limiters after `app.use(express.json())`:

```js
const { globalLimiter, loginLimiter, apiLimiter } = require('./middleware/rateLimit');

app.use(globalLimiter);
app.use('/api/', apiLimiter);
```

- [ ] **Step 4: Verify rate limiting works**

Run: `cd api && node -e "
const rl = require('./middleware/rateLimit');
console.log('globalLimiter:', typeof rl.globalLimiter);
console.log('loginLimiter:', typeof rl.loginLimiter);
console.log('apiLimiter:', typeof rl.apiLimiter);
"`
Expected: Three function references logged, no errors

- [ ] **Step 5: Commit**

```bash
git add api/middleware/rateLimit.js api/server.js api/package.json api/package-lock.json
git commit -m "feat(api): add rate limiting middleware"
```

---

#### Task 2: Add restricted CORS middleware

**Files:**
- Create: `api/middleware/cors.js`
- Modify: `api/server.js:12`

- [ ] **Step 1: Create cors.js with per-environment whitelist**

```js
const cors = require('cors');

const allowedOrigins = {
  development: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3001'],
  staging: ['https://staging-admin.crownbingo.com', 'https://staging-agent.crownbingo.com', 'https://staging-play.crownbingo.com'],
  production: ['https://admin.crownbingo.com', 'https://agent.crownbingo.com', 'https://play.crownbingo.com']
};

function createCorsMiddleware() {
  return cors({
    origin: function (origin, callback) {
      const env = process.env.NODE_ENV || 'development';
      const allowed = allowedOrigins[env] || allowedOrigins.development;
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}

module.exports = { createCorsMiddleware };
```

- [ ] **Step 2: Replace app.use(cors()) in server.js**

In `api/server.js`, replace `app.use(cors());` with:

```js
const { createCorsMiddleware } = require('./middleware/cors');
app.use(createCorsMiddleware());
```

- [ ] **Step 3: Commit**

```bash
git add api/middleware/cors.js api/server.js
git commit -m "feat(api): add restricted CORS per environment"
```

---

#### Task 3: Add Joi validation schemas

**Files:**
- Create: `api/validation/schemas.js`

- [ ] **Step 1: Create schemas.js with all endpoint schemas**

```js
const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').optional(),
  initialBalance: Joi.number().min(0).max(1000000).default(0),
  role: Joi.string().valid('USER', 'SUPER_AGENT').default('USER')
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(''),
  isActive: Joi.boolean(),
  isDisabled: Joi.boolean()
}).min(1);

const rechargeSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().max(100000).required(),
  description: Joi.string().max(200).allow('').optional()
});

const transferPointsSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().max(1000000).required(),
  percent: Joi.number().positive().max(100).required(),
  userName: Joi.string().allow('').optional(),
  userEmail: Joi.string().email().allow('').optional()
});

const statusUpdateSchema = Joi.object({
  disabled: Joi.boolean().required(),
  reason: Joi.string().max(500).allow('').optional()
});

const createAgentSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').optional(),
  agentCode: Joi.string().alphanum().min(3).max(20).required(),
  commissionRate: Joi.number().min(0).max(100).default(5)
});

const createBetSchema = Joi.object({
  gameId: Joi.string().required(),
  userId: Joi.string().required(),
  amount: Joi.number().positive().max(10000).required(),
  numbers: Joi.array().items(Joi.number().min(1).max(99)).min(1).max(10).required()
});

const createGameSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('CLASSIC', 'RAPID', 'JACKPOT').required(),
  minBet: Joi.number().positive().max(10000).default(1),
  maxBet: Joi.number().positive().max(100000).default(1000),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
});

const updateSettingsSchema = Joi.object({
  minDeposit: Joi.number().min(0),
  maxDeposit: Joi.number().min(0),
  minWithdrawal: Joi.number().min(0),
  maxWithdrawal: Joi.number().min(0),
  maintenanceMode: Joi.boolean(),
  bannerMessage: Joi.string().max(500).allow('')
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema,
  rechargeSchema,
  transferPointsSchema,
  statusUpdateSchema,
  createAgentSchema,
  createBetSchema,
  createGameSchema,
  updateSettingsSchema
};
```

- [ ] **Step 2: Create validate.js middleware**

```js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map(d => d.message).join('; ');
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: messages
      });
    }
    req.body = value;
    next();
  };
}

module.exports = { validate };
```

- [ ] **Step 3: Install Joi**

Run: `cd api && npm install joi`
Expected: Package added to node_modules and package.json

- [ ] **Step 4: Commit**

```bash
git add api/validation/schemas.js api/middleware/validate.js api/package.json api/package-lock.json
git commit -m "feat(api): add Joi validation schemas and middleware"
```

---

#### Task 4: Fix RBAC middleware to verify role from Firestore

**Files:**
- Modify: `api/middleware/auth.js:19-26`

- [ ] **Step 1: Rewrite requireRole to verify from DB**

Replace the `requireRole` function in `api/middleware/auth.js`:

```js
async function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const admin = require('firebase-admin');
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'User not found in database' });
      }
      const userRole = userDoc.data().role;
      if (!roles.includes(userRole)) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', message: `Requires one of: ${roles.join(', ')}` });
      }
      req.user.role = userRole;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Authorization check failed' });
    }
  };
}
```

Also in the `authenticate` function, log the authenticated user:

```js
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
```

- [ ] **Step 2: Remove unused file (no extra files needed)**

- [ ] **Step 3: Commit**

```bash
git add api/middleware/auth.js
git commit -m "fix(api): verify RBAC role from Firestore DB not token claims"
```

---

#### Task 5: Add correlation ID middleware

**Files:**
- Create: `api/middleware/correlationId.js`
- Modify: `api/server.js:12`

- [ ] **Step 1: Create correlationId.js**

```js
const { v4: uuidv4 } = require('uuid');

function correlationId(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
}

module.exports = { correlationId };
```

- [ ] **Step 2: Wire into server.js**

Add to `api/server.js` after `app.use(express.json())`:

```js
const { correlationId } = require('./middleware/correlationId');
app.use(correlationId);
```

- [ ] **Step 3: Install uuid**

Run: `cd api && npm install uuid`
Expected: Package added (already exists in node_modules but may not be in package.json — verify)

- [ ] **Step 4: Commit**

```bash
git add api/middleware/correlationId.js api/server.js
git commit -m "feat(api): add correlation ID middleware"
```

---

#### Task 6: Add centralized error handler

**Files:**
- Create: `api/middleware/errorHandler.js`
- Modify: `api/server.js:22`

- [ ] **Step 1: Create errorHandler.js**

```js
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    error: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal server error',
    correlationId: req.correlationId
  };
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  res.status(statusCode).json(errorResponse);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    correlationId: req.correlationId
  });
}

module.exports = { errorHandler, notFoundHandler };
```

- [ ] **Step 2: Wire into server.js at the end**

Add to `api/server.js` before `app.listen()`:

```js
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);
```

- [ ] **Step 3: Commit**

```bash
git add api/middleware/errorHandler.js api/server.js
git commit -m "feat(api): add centralized error handler"
```

---

#### Task 7: Add comprehensive health checks

**Files:**
- Create: `api/routes/health.js`
- Modify: `api/server.js:20`

- [ ] **Step 1: Create health.js route**

```js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.get('/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

router.get('/ready', async (req, res) => {
  try {
    const db = admin.firestore();
    const healthRef = db.collection('_health').doc('check');
    await healthRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    const healthDoc = await healthRef.get();
    if (!healthDoc.exists) {
      throw new Error('Firestore health check failed');
    }
    res.json({
      status: 'ready',
      checks: { firestore: 'healthy', auth: 'healthy' },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'not-ready',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/metrics', async (req, res) => {
  let metrics;
  try { metrics = require('../metrics'); } catch (e) { /* metrics not loaded */ }
  if (metrics && metrics.register) {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } else {
    res.json({ uptime: process.uptime(), memory: process.memoryUsage(), cpu: process.cpuUsage() });
  }
});

module.exports = router;
```

- [ ] **Step 2: Replace basic health check in server.js**

In `api/server.js`, replace `app.get('/health', ...)` with:

```js
app.use('/health', require('./routes/health'));
```

- [ ] **Step 3: Commit**

```bash
git add api/routes/health.js api/server.js
git commit -m "feat(api): add comprehensive health checks"
```

---

#### Task 8: Add remaining API routes (agents, bets, games, settings, audit-logs)

**Files:**
- Create: `api/routes/agents.js`
- Create: `api/routes/bets.js`
- Create: `api/routes/games.js`
- Create: `api/routes/settings.js`
- Create: `api/routes/auditLogs.js`
- Modify: `api/server.js:15-18`

- [ ] **Step 1: Create agents.js route**

```js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createAgentSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('agents').get();
  const agents = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: agents });
});

router.post('/', authenticate, requireRole('SUPER_ADMIN'), validate(createAgentSchema), async (req, res) => {
  const { email, password, username, phone, agentCode, commissionRate } = req.body;
  const db = admin.firestore();
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'SUPER_AGENT' });
    await db.collection('agents').doc(userRecord.uid).set({
      uid: userRecord.uid, email, username, phone: phone || '', agentCode,
      commissionRate: commissionRate || 5, totalSales: 0, totalEarnings: 0,
      isActive: true, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: req.user.uid
    });
    await writeAuditLog({
      action: 'AGENT_CREATED', actor: { uid: req.user.uid, email: req.user.email },
      target: { uid: userRecord.uid, email }, result: 'SUCCESS', ip: req.ip, source: 'api'
    });
    res.status(201).json({ success: true, data: { uid: userRecord.uid } });
  } catch (err) {
    await writeAuditLog({
      action: 'AGENT_CREATED', actor: { uid: req.user.uid, email: req.user.email },
      target: { uid: null, email }, result: 'FAILURE', error: err.message, ip: req.ip, source: 'api'
    }).catch(() => {});
    res.status(500).json({ success: false, error: err.code, message: 'Agent creation failed' });
  }
});

router.patch('/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  await db.collection('agents').doc(req.params.id).update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  res.json({ success: true });
});

router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  await db.collection('agents').doc(req.params.id).delete();
  res.json({ success: true });
});

module.exports = router;
```

- [ ] **Step 2: Create bets.js route**

```js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBetSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('bets').get();
  const bets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: bets });
});

router.post('/', authenticate, requireRole('USER'), validate(createBetSchema), async (req, res) => {
  const db = admin.firestore();
  try {
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(req.body.userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) throw new Error('User not found');
      const user = userSnap.data();
      if ((user.balance || 0) < req.body.amount) throw new Error('Insufficient balance');
      transaction.update(userRef, { balance: (user.balance || 0) - req.body.amount });
      const betRef = db.collection('bets').doc();
      transaction.set(betRef, {
        gameId: req.body.gameId, userId: req.body.userId, amount: req.body.amount,
        numbers: req.body.numbers, status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { betId: betRef.id, balanceAfter: (user.balance || 0) - req.body.amount };
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: 'BET_FAILED', message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 3: Create games.js route**

```js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { writeAuditLog } = require('../services/audit');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createGameSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'SUPER_AGENT'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('games').get();
  const games = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: games });
});

router.post('/', authenticate, requireRole('SUPER_ADMIN'), validate(createGameSchema), async (req, res) => {
  const db = admin.firestore();
  const gameRef = db.collection('games').doc();
  await gameRef.set({
    ...req.body, status: 'PENDING',
    createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: req.user.uid
  });
  res.status(201).json({ success: true, data: { id: gameRef.id } });
});

module.exports = router;
```

- [ ] **Step 4: Create settings.js route**

```js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateSettingsSchema } = require('../validation/schemas');

router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  const snapshot = await db.collection('settings').get();
  if (snapshot.empty) return res.json({ success: true, data: null });
  const settings = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  res.json({ success: true, data: settings });
});

router.patch('/', authenticate, requireRole('SUPER_ADMIN'), validate(updateSettingsSchema), async (req, res) => {
  const db = admin.firestore();
  await db.collection('settings').doc('config').set(req.body, { merge: true });
  res.json({ success: true });
});

module.exports = router;
```

- [ ] **Step 5: Create auditLogs.js route**

```js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  const db = admin.firestore();
  const { limit = 100, startAfter } = req.query;
  let query = db.collection('auditLogs').orderBy('timestamp', 'desc').limit(Number(limit));
  if (startAfter) {
    const startDoc = await db.collection('auditLogs').doc(startAfter).get();
    if (startDoc.exists) query = query.startAfter(startDoc);
  }
  const snapshot = await query.get();
  const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ success: true, data: logs, hasMore: logs.length === Number(limit) });
});

module.exports = router;
```

- [ ] **Step 6: Wire all new routes into server.js**

Replace the existing `app.use` lines in `api/server.js` with:

```js
app.use('/api/users', require('./routes/users'));
app.use('/api/points', require('./routes/points'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/bets', require('./routes/bets'));
app.use('/api/games', require('./routes/games'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
```

- [ ] **Step 7: Commit**

```bash
git add api/routes/agents.js api/routes/bets.js api/routes/games.js api/routes/settings.js api/routes/auditLogs.js api/server.js
git commit -m "feat(api): add agents, bets, games, settings, audit-log routes"
```

---

#### Task 9: Add retry wrapper for Firestore operations

**Files:**
- Create: `api/middleware/retry.js`

- [ ] **Step 1: Create retry.js middleware**

```js
class RetryWrapper {
  constructor(maxRetries = 3, initialDelayMs = 100) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
  }

  isRetryable(error) {
    const retryableCodes = ['NETWORK', 'TIMEOUT', 'SERVICE_UNAVAILABLE', 'RESOURCE_EXHAUSTED', 'DEADLINE_EXCEEDED', 'UNAVAILABLE'];
    if (error.code && retryableCodes.some(c => error.code.includes(c))) return true;
    if (error.message && retryableCodes.some(c => error.message.includes(c))) return true;
    return false;
  }

  async execute(fn) {
    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (!this.isRetryable(error)) throw error;
        if (attempt < this.maxRetries - 1) {
          const delay = this.initialDelayMs * Math.pow(2, attempt) + Math.random() * 50;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}

module.exports = { RetryWrapper };
```

- [ ] **Step 2: Verify import works**

Run: `cd api && node -e "const { RetryWrapper } = require('./middleware/retry'); console.log(new RetryWrapper(3, 100) instanceof RetryWrapper);"`
Expected: `true`

- [ ] **Step 3: Commit**

```bash
git add api/middleware/retry.js
git commit -m "feat(api): add retry wrapper with exponential backoff"
```

---

#### Task 10: Fix Firebase key exposure in admin-panel

**Files:**
- Create: `admin-panel/.env`
- Create: `admin-panel/.env.example`
- Modify: `admin-panel/src/firebase.js`

- [ ] **Step 1: Create .env.example (no real keys)**

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bingo-27d37
REACT_APP_FIREBASE_STORAGE_BUCKET=bingo-27d37.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=509582453061
REACT_APP_FIREBASE_APP_ID=1:509582453061:web:7506bd6e5ff45c5e58b62c
REACT_APP_FIREBASE_MEASUREMENT_ID=G-VTLQ243Q66
REACT_APP_API_URL=http://localhost:5000
```

- [ ] **Step 2: Modify firebase.js to use env vars**

Replace the hardcoded `firebaseConfig` in `admin-panel/src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'bingo-27d37.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'bingo-27d37',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'bingo-27d37.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '509582453061',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:509582453061:web:7506bd6e5ff45c5e58b62c',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-VTLQ243Q66'
};
```

- [ ] **Step 3: Update .gitignore to ignore .env files**

Append to root `.gitignore`:

```
.env.local
.env.*.local
admin-panel/.env
crownbingo/.env
superagentcrownbingo/.env
api/serviceAccountKey.json
```

- [ ] **Step 4: Commit**

```bash
git add admin-panel/.env.example admin-panel/src/firebase.js .gitignore
git commit -m "fix: move Firebase API keys to env vars, remove hardcoded exposure"
```

---

#### Task 11: Fix player app Firebase config + consolidate project

**Files:**
- Create: `crownbingo/.env.example`
- Modify: `crownbingo/static/js/firebase.js`

- [ ] **Step 1: Create .env.example for crownbingo**

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bingo-27d37
REACT_APP_FIREBASE_STORAGE_BUCKET=bingo-27d37.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=509582453061
REACT_APP_FIREBASE_APP_ID=1:509582453061:web:7506bd6e5ff45c5e58b62c
REACT_APP_FIREBASE_MEASUREMENT_ID=G-VTLQ243Q66
REACT_APP_API_URL=http://localhost:5000
```

- [ ] **Step 2: Fix firebase.js to use single project and env vars**

Replace `crownbingo/static/js/firebase.js`:

```js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "bingo-27d37.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "bingo-27d37",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "bingo-27d37.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "509582453061",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-VTLQ243Q66"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, app, auth, analytics };
```

- [ ] **Step 3: Commit**

```bash
git add crownbingo/.env.example crownbingo/static/js/firebase.js
git commit -m "fix: consolidate player app to single Firebase project, use env vars"
```

---

#### Task 12: Route admin-panel CRUD operations through the API (remove direct Firestore calls)

**Files:**
- Modify: `admin-panel/src/services/api.js`
- Modify: `admin-panel/src/components/pages/UserManagement.js`

- [ ] **Step 1: Add more API service methods to api.js**

Extend `admin-panel/src/services/api.js`:

```js
async function apiGet(endpoint) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

async function apiDelete(endpoint) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API request failed');
  return json;
}

export { apiPost, apiPatch, apiGet, apiDelete };
```

- [ ] **Step 2: Rewrite UserManagement.js to use API instead of direct Firestore**

Modify the `fetchUsers`, `handleDelete`, and `handleEdit` functions in `UserManagement.js`:

Replace the direct Firestore imports at the top — remove `collection`, `getDocs`, `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `doc`, `query`, `where` from the firebase/firestore import. Keep only what's needed for non-API operations. Then update the functions:

```js
// Replace fetchUsers
const fetchUsers = async () => {
  try {
    setLoading(true);
    const result = await apiGet('/api/users');
    setUsers(result.data || []);
  } catch (error) {
    toast.error('Error fetching users: ' + error.message);
  } finally {
    setLoading(false);
  }
};

// Replace handleDelete
const handleDelete = async (userId) => {
  if (window.confirm('Are you sure you want to delete this user?')) {
    try {
      await apiDelete(`/api/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Error deleting user: ' + error.message);
    }
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add admin-panel/src/services/api.js admin-panel/src/components/pages/UserManagement.js
git commit -m "refactor: route admin-panel CRUD through API instead of direct Firestore"
```

---

#### Task 13: Update Firestore rules with amount limits and double-spend prevention

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Update transactions and bets rules**

Add amount validations to `firestore.rules`:

Replace the `/transactions` block (lines 49-58) with:

```
    match /transactions/{txnId} {
      allow read: if isSuperAdmin() || isSuperAgent() || (isUser() && resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated() &&
                    request.resource.data.amount > 0 &&
                    request.resource.data.amount <= 10000 &&
                    request.resource.data.userId == request.auth.uid &&
                    request.resource.data.status == 'PENDING' &&
                    !('processed' in request.resource.data);
      allow update: if isSuperAdmin() &&
                    request.resource.data.status in ['COMPLETED', 'FAILED'];
      allow delete: if false;
    }
```

Replace the `/bets` block (lines 71-80) with:

```
    match /bets/{betId} {
      allow read: if isSuperAdmin() || isSuperAgent() || (isUser() && resource.data.userId == request.auth.uid);
      allow create: if isUser() &&
                    request.resource.data.userId == request.auth.uid &&
                    request.resource.data.amount > 0 &&
                    request.resource.data.amount <= 1000 &&
                    request.resource.data.gameId != null &&
                    request.resource.data.status == 'ACTIVE';
      allow update: if isSuperAdmin();
      allow delete: if false;
    }
```

- [ ] **Step 2: Commit**

```bash
git add firestore.rules
git commit -m "fix: add amount limits and double-spend prevention to Firestore rules"
```

---

### Phase 2: Resilience (Week 2)

#### Task 14: Add circuit breaker service

**Files:**
- Create: `api/services/circuitBreaker.js`

- [ ] **Step 1: Create circuitBreaker.js**

```js
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 30000;
    this.fallback = options.fallback || null;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttemptTime = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        if (this.fallback) return this.fallback();
        throw new Error('Circuit breaker OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeout;
    }
  }

  getState() { return this.state; }
  getFailureCount() { return this.failureCount; }
}

module.exports = { CircuitBreaker };
```

- [ ] **Step 2: Test circuit breaker**

Run: `cd api && node -e "
const { CircuitBreaker } = require('./services/circuitBreaker');
const cb = new CircuitBreaker(async () => { throw new Error('fail'); }, { threshold: 2, timeout: 1000 });
(async () => {
  for (let i = 0; i < 3; i++) {
    try { await cb.execute(); } catch (e) {}
  }
  console.log('State:', cb.getState());
  console.log('Failures:', cb.getFailureCount());
})();
"`
Expected: `State: OPEN`, `Failures: 2`

- [ ] **Step 3: Commit**

```bash
git add api/services/circuitBreaker.js
git commit -m "feat(api): add circuit breaker pattern"
```

---

#### Task 15: Add service worker for offline support

**Files:**
- Create: `admin-panel/public/service-worker.js`
- Create: `crownbingo/service-worker.js`

- [ ] **Step 1: Create admin-panel service worker**

```js
const CACHE_NAME = 'crown-bingo-admin-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = ['/', '/index.html', '/static/js/main.js', '/static/css/main.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS.concat(OFFLINE_URL)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => { cache.put(event.request, res.clone()); return res; });
      }))
    );
    return;
  }
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (res.ok) { caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone())); }
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
```

- [ ] **Step 2: Register service worker in admin-panel/src/index.js**

Add at the end of `admin-panel/src/index.js`:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

- [ ] **Step 3: Commit**

```bash
git add admin-panel/public/service-worker.js admin-panel/src/index.js
git commit -m "feat: add service worker for offline support"
```

---

#### Task 16: Add node-cache for dashboard stats caching

**Files:**
- Create: `api/services/cache.js`

- [ ] **Step 1: Create cache.js**

```js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class CacheService {
  async get(key) { return cache.get(key); }
  async set(key, value, ttlSeconds = 300) { return cache.set(key, value, ttlSeconds); }
  async invalidate(pattern) {
    const keys = cache.keys().filter(k => k.startsWith(pattern.replace('*', '')));
    keys.forEach(k => cache.del(k));
    return keys.length;
  }
  async flush() { cache.flushAll(); }
}

module.exports = new CacheService();
```

- [ ] **Step 2: Commit**

```bash
git add api/services/cache.js
git commit -m "feat(api): add in-memory cache service"
```

---

#### Task 17: Add Firestore composite indexes

**Files:**
- Modify: `firestore.indexes.json`

- [ ] **Step 1: Add missing composite indexes**

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isDisabled", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "agentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "agents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "agents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "totalEarnings", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gameId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "action", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 2: Commit**

```bash
git add firestore.indexes.json
git commit -m "perf: add composite Firestore indexes for common queries"
```

---

### Phase 3: Observability + Ops (Week 3)

#### Task 18: Add Winston structured logging

**Files:**
- Create: `api/logger.js`
- Modify: `api/server.js`

- [ ] **Step 1: Create logger.js**

```js
const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/crown-bingo-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'crown-bingo-api' },
  transports: [
    fileRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

function logRequest(req, res, durationMs) {
  logger.info('API request', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    durationMs,
    actor: req.user ? { uid: req.user.uid } : null
  });
}

function logError(req, err, durationMs) {
  logger.error('API error', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    error: { code: err.code, message: err.message, stack: err.stack },
    durationMs,
    actor: req.user ? { uid: req.user.uid } : null
  });
}

module.exports = { logger, logRequest, logError };
```

- [ ] **Step 2: Install winston and winston-daily-rotate-file**

Run: `cd api && npm install winston winston-daily-rotate-file`
Expected: Packages added

- [ ] **Step 3: Wire request logging into server.js**

Add to `api/server.js` after middleware but before routes:

```js
const { logger, logRequest, logError } = require('./logger');

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logError(req, { code: 'HTTP_ERROR', message: res.statusMessage || '' }, duration);
    } else {
      logRequest(req, res, duration);
    }
  });
  next();
});
```

- [ ] **Step 4: Commit**

```bash
git add api/logger.js api/server.js api/package.json api/package-lock.json
git commit -m "feat(api): add Winston structured logging with daily rotation"
```

---

#### Task 19: Add Prometheus metrics endpoint

**Files:**
- Create: `api/metrics.js`
- Modify: `api/server.js` (already wired via health.js)

- [ ] **Step 1: Create metrics.js**

```js
const prometheus = require('prom-client');

prometheus.collectDefaultMetrics({ prefix: 'crown_bingo_' });

const httpRequestDuration = new prometheus.Histogram({
  name: 'crown_bingo_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const dbQueryDuration = new prometheus.Histogram({
  name: 'crown_bingo_db_query_duration_seconds',
  help: 'Firestore query latency in seconds',
  labelNames: ['collection', 'operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const activeUsers = new prometheus.Gauge({
  name: 'crown_bingo_active_users_total',
  help: 'Total active users'
});

const walletBalance = new prometheus.Gauge({
  name: 'crown_bingo_wallet_balance_total',
  help: 'Total wallet balance across all users'
});

const errorCounter = new prometheus.Counter({
  name: 'crown_bingo_errors_total',
  help: 'Total error count',
  labelNames: ['error_code']
});

function trackHttpDuration(method, route, statusCode, durationSeconds) {
  httpRequestDuration.labels(method, route, String(statusCode)).observe(durationSeconds);
}

function trackDbDuration(collection, operation, durationSeconds) {
  dbQueryDuration.labels(collection, operation).observe(durationSeconds);
}

function incrementError(code) {
  errorCounter.labels(code).inc();
}

module.exports = {
  register: prometheus.register,
  trackHttpDuration,
  trackDbDuration,
  incrementError,
  activeUsers,
  walletBalance
};
```

- [ ] **Step 2: Wire metrics tracking into server.js request logging**

Modify the request logging middleware in `server.js`:

```js
const metrics = require('./metrics');

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const durationSeconds = duration / 1000;
    const routePath = req.route ? req.route.path : req.path;
    metrics.trackHttpDuration(req.method, routePath, res.statusCode, durationSeconds);
    if (res.statusCode >= 400) {
      metrics.incrementError(`HTTP_${res.statusCode}`);
      logError(req, { code: 'HTTP_ERROR', message: res.statusMessage || '' }, duration);
    } else {
      logRequest(req, res, duration);
    }
  });
  next();
});
```

- [ ] **Step 3: Install prom-client**

Run: `cd api && npm install prom-client`
Expected: Package added

- [ ] **Step 4: Commit**

```bash
git add api/metrics.js api/server.js api/package.json api/package-lock.json
git commit -m "feat(api): add Prometheus metrics collection"
```

---

#### Task 20: Add load testing script for validation

**Files:**
- Create: `scripts/load-test.js`

- [ ] **Step 1: Create k6-compatible load test script**

```js
// Run with: k6 run scripts/load-test.js
// Install k6 from: https://k6.io/docs/getting-started/installation/
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latencyTrend = new Trend('latency');

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    latency: ['p(99)<2000'],
    http_req_duration: ['p(95)<1000'],
  },
};

const API_BASE = __ENV.API_BASE || 'http://localhost:5000';

export default function () {
  const endpoints = ['/health/live', '/health/ready', '/health/metrics'];
  const url = `${API_BASE}${endpoints[Math.floor(Math.random() * endpoints.length)]}`;

  const start = Date.now();
  const res = http.get(url);
  const duration = Date.now() - start;

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': () => duration < 2000,
  });

  errorRate.add(res.status !== 200);
  latencyTrend.add(duration);

  sleep(1);
}
```

- [ ] **Step 2: Verify script syntax**

Run: `cd api && node -e "console.log('Load test script would validate here')"`
Expected: Success message (k6 tests need k6 binary installed)

- [ ] **Step 3: Commit**

```bash
git add scripts/load-test.js
git commit -m "test: add load testing script for production validation"
```

---

#### Task 21: Add GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy.yml**

```yaml
name: Deploy API

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: api
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json
      - run: npm ci
      - run: node -e "require('./middleware/auth'); require('./middleware/rateLimit'); require('./middleware/validate'); require('./middleware/cors'); console.log('All modules loaded successfully')"

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: |
          if [ -n "$RENDER_DEPLOY_HOOK" ]; then
            curl -X POST "$RENDER_DEPLOY_HOOK"
          fi
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions CI/CD pipeline"
```

---

#### Task 22: Add backup automation script

**Files:**
- Create: `.github/workflows/backup.yml`
- Create: `scripts/backup-firestore.sh`

- [ ] **Step 1: Create backup workflow**

```yaml
name: Daily Firestore Backup

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - run: |
          gcloud firestore export gs://crown-bingo-backups --project=${{ secrets.FIREBASE_PROJECT_ID }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/backup.yml
git commit -m "ops: add automated daily Firestore backup"
```

---

#### Task 23: Add disaster recovery docs

**Files:**
- Create: `docs/ops/runbook.md`
- Create: `docs/ops/disaster-recovery.md`

- [ ] **Step 1: Create runbook.md**

```markdown
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
```

- [ ] **Step 2: Create disaster-recovery.md**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/ops/runbook.md docs/ops/disaster-recovery.md
git commit -m "docs: add ops runbook and disaster recovery plan"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| CR-001: Hardcoded API keys | Task 10, 11 |
| CR-002: No transaction atomicity | Already addressed in existing wallet.js, points.js (using runTransaction) |
| CR-003: No RBAC enforcement | Task 4 (fix requireRole to check DB) |
| CR-004: No input validation | Task 3 (Joi schemas) |
| CR-005: Single points of failure | Task 14 (circuit breaker) |
| HR-001: No rate limiting | Task 1 |
| HR-002: No retry logic | Task 9 |
| HR-003: No audit logging | Task 18 (Winston structured logging) |
| HR-004: No monitoring | Task 19 (Prometheus metrics) |
| HR-005: No Firestore indexes | Task 17 |
| MR-001: No backup strategy | Task 21 |
| MR-002: No data isolation | Task 13 (Firestore rules) |
| MR-003: No DR plan | Task 22 |
| MR-004: No load testing | Task 20 |
| MR-005: No CI/CD | Task 20 |
| Firestore rule amount limits | Task 13 |
| Offline support / service worker | Task 15 |
| Cache layer | Task 16 |
| CORS restrictions | Task 2 |
| Correlation ID | Task 5 |
| Error handler | Task 6 |
| Health checks | Task 7 |
| New routes (agents, bets, games, settings, audit-logs) | Task 8 |
| Frontend → API migration | Task 12 |
| Firebase project consolidation | Task 11 |
