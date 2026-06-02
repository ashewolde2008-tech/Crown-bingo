# 🚨 CROWN BINGO: IMMEDIATE ACTION ITEMS
**Status**: CRITICAL - Action Required  
**Severity**: 🔴 HIGH  
**Timeline**: START IMMEDIATELY  

---

## ⚡ TOP 5 SECURITY ISSUES (Next 48 Hours)

### 1. EXPOSED API KEYS ⚠️ MOST CRITICAL

**Current Status**:
```javascript
// ❌ EXPOSED in admin-panel/src/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
  // ... more config
};
```

**IMMEDIATE ACTIONS** (Do NOW):
```bash
# Step 1: Rotate Firebase keys immediately
# In Firebase Console: 
# 1. Go to Project Settings > Service Accounts
# 2. Create new private key
# 3. Disable old key

# Step 2: Update admin-panel/.env
REACT_APP_FIREBASE_API_KEY=<new-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37.firebaseapp.com
# ... other config

# Step 3: Update .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Step 4: Remove sensitive data from git history
git filter-branch --force --index-filter \
  'git rm -r --cached --ignore-unmatch admin-panel/src/firebase.js' \
  -- --all

# Step 5: Force push
git push origin -f --all

# Step 6: Verify keys are removed from GitHub
# Search GitHub for old API key - if found, rotate AGAIN
```

---

### 2. NO INPUT VALIDATION

**Current Status**:
```javascript
// ❌ api/routes/users.js
if (!email || !password) {  // Only existence check
  return res.status(400).json({ ... });
}
```

**IMMEDIATE FIX** (Today, 2 hours):
```bash
npm install joi
```

```javascript
// api/validation/schemas.js
const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(12)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[!@#$%^&*]/)
    .required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  initialBalance: Joi.number().min(0).max(1000000).required(),
  role: Joi.string().valid('USER', 'SUPER_AGENT').required()
});

module.exports = { createUserSchema };

// api/routes/users.js
const { createUserSchema } = require('../validation/schemas');

router.post('/', authenticate, async (req, res) => {
  const { error, value } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: error.details[0].message
    });
  }

  try {
    // Use validated 'value', not req.body
    const userRecord = await admin.auth().createUser({
      email: value.email,
      password: value.password
    });
    // ... rest of code
  } catch (err) {
    // ... error handling
  }
});
```

---

### 3. NO RATE LIMITING

**Current Status**:
```javascript
// ❌ api/server.js
app.use(cors());
app.use(express.json());
// ❌ NO RATE LIMITER
```

**IMMEDIATE FIX** (Today, 1 hour):
```bash
npm install express-rate-limit redis
```

```javascript
// api/server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const redis = require('redis');
const RedisStore = require('rate-limit-redis');

const app = express();
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Global limiter
const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 60 * 1000,
  max: 100
});

// Login limiter (stricter)
const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'login:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.use(limiter);
app.post('/auth/login', loginLimiter, authController.login);
app.use('/api/', limiter);
```

---

### 4. WEAK FIRESTORE RULES

**Current Issue**:
```javascript
// ⚠️ No financial validation
match /transactions/{txnId} {
  allow read: if isSuperAdmin() || ...;
  allow create: if isAuthenticated();  // ❌ ANY amount!
}

match /bets/{betId} {
  allow create: if isAuthenticated();  // ❌ No amount validation!
}
```

**IMMEDIATE PATCH** (Today):
```javascript
// firestore.rules - Add these rules
match /transactions/{txnId} {
  allow read: if isSuperAdmin() || isSuperAgent() || 
              (isUser() && resource.data.userId == request.auth.uid);
  allow create: if isAuthenticated() && 
                request.resource.data.amount > 0 &&
                request.resource.data.amount <= 10000 &&  // ✅ MAX LIMIT
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.status == 'PENDING' &&
                !('processed' in request.resource.data);  // ✅ Prevent double-spend
  allow update: if isSuperAdmin();
  allow delete: if false;
}

match /bets/{betId} {
  allow read: if isSuperAdmin() || isSuperAgent() || 
              (isUser() && resource.data.userId == request.auth.uid);
  allow create: if isUser() &&
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.amount > 0 &&
                request.resource.data.amount <= 1000 &&  // ✅ BET LIMIT
                request.resource.data.gameId != null &&
                request.resource.data.status == 'ACTIVE';
  allow update: if isSuperAdmin();
  allow delete: if false;
}
```

**Deploy immediately**:
```bash
firebase deploy --only firestore:rules
```

---

### 5. MISSING CORS CONFIGURATION

**Current Status**:
```javascript
// ❌ Allows ALL origins
app.use(cors());
```

**IMMEDIATE FIX** (Today, 15 minutes):
```javascript
// api/server.js
const allowedOrigins = {
  development: ['http://localhost:3000', 'http://localhost:5000'],
  staging: ['https://staging-admin.crownbingo.com'],
  production: [
    'https://admin.crownbingo.com',
    'https://agent.crownbingo.com',
    'https://play.crownbingo.com'
  ]
};

app.use(cors({
  origin: function (origin, callback) {
    const allowed = allowedOrigins[process.env.NODE_ENV || 'development'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS rejected'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🔴 CRITICAL BUGS TO FIX (This Week)

### Bug 1: Firebase Multi-Project Sync Issue

**Problem**: Admin panel uses different Firebase project
```javascript
// admin-panel/src/firebase.js ← bingo-27d37-5661f project
// crownbingo/static/js/firebase.js ← bingo-27d37 project
// Data is siloed - admin can't see user data
```

**Fix**:
```bash
# Option 1: Consolidate to single project
# Migrate admin-panel-5661f data to bingo-27d37

# Option 2: Setup Firestore shards
# Replicate collections between projects via Cloud Functions

# Recommended: Use Node.js API layer
# API talks to both projects and syncs data
```

---

### Bug 2: Admin Verification Only Frontend

**Problem**:
```javascript
// ❌ Frontend-only check (easily bypassed)
async function isUserAdmin(user) {
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.role === 'SUPER_ADMIN';
}
```

**Fix**: Always verify server-side
```javascript
// api/middleware/auth.js
async function verifyAdminRole(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decoded = await admin.auth().verifyIdToken(token);
  
  // ✅ Server-side check
  const userDoc = await db.collection('users').doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  req.user = decoded;
  next();
}

app.post('/api/admin/users', verifyAdminRole, createUserHandler);
```

---

### Bug 3: No Error Retry

**Problem**:
```javascript
// ❌ Transient errors cause failures
try {
  await deleteUser(userId);
  toast.success('User deleted');
} catch (error) {
  toast.error(error.message);  // ❌ No retry
}
```

**Fix**:
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

async function handleDeleteUser(userId) {
  try {
    await retryWithBackoff(() => deleteUser(userId));
    toast.success('User deleted');
  } catch (error) {
    toast.error('Failed to delete user');
  }
}
```

---

## ✅ WEEK 1 CHECKLIST

- [ ] **DAY 1**: Rotate Firebase API keys
- [ ] **DAY 1**: Move keys to .env files
- [ ] **DAY 1**: Update .gitignore and force push
- [ ] **DAY 2**: Add Joi input validation to all API endpoints
- [ ] **DAY 2**: Add rate limiting (express-rate-limit + Redis)
- [ ] **DAY 3**: Update Firestore rules with amount limits
- [ ] **DAY 3**: Fix CORS configuration
- [ ] **DAY 3**: Deploy Firestore rule changes
- [ ] **DAY 4**: Add server-side admin role verification
- [ ] **DAY 4**: Implement retry logic for transient errors
- [ ] **DAY 5**: Setup error logging with Winston
- [ ] **DAY 5**: Test all changes in staging environment

---

## 📊 METRICS TO TRACK

Once these fixes are in place, monitor:

```javascript
// Errors avoided per day
logger.info('Security fix: Prevented unauthorized API access', {
  endpoint: '/api/users',
  validation: 'email_format',
  blocked_count: 127
});

// Rate limit triggers
logger.warn('Rate limit triggered', {
  ip: req.ip,
  endpoint: '/auth/login',
  attempts: 6,
  window: '15m'
});

// Transaction success rate
logger.info('Transaction completed', {
  txnId: txn.id,
  amount: txn.amount,
  retry_count: 2,
  total_time_ms: 350
});
```

---

## 🚀 QUICK START COMMANDS

```bash
# Install all required packages
cd api
npm install joi express-rate-limit redis rate-limit-redis winston @google-cloud/logging-winston

cd ../admin-panel
npm install

# Start development with new security
npm run build --prefix api
npm start --prefix api

# Deploy to Firebase (after Firestore rule changes)
firebase deploy --only firestore:rules

# Test rate limiting
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

# Repeat 6 times - should get rate limited on 6th attempt
```

---

## 📋 DEPLOYMENT CHECKLIST

**Before deploying to production**:
- [ ] All API keys removed from source code
- [ ] Firestore rules deployed and tested
- [ ] Rate limiting verified in staging
- [ ] Input validation tested with invalid data
- [ ] CORS whitelist verified for all domains
- [ ] Audit logs generated for all admin actions
- [ ] Backup created before deployment
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Team notified of changes

---

## 🆘 EMERGENCY CONTACTS

If anything breaks:
1. Check Firebase status: https://status.firebase.google.com
2. Review logs: Firebase Console > Firestore > Logs
3. Rollback to previous deploy: Netlify > Production > Previous Deploy
4. Contact Firebase support if data corrupted

---

**NEXT STEP**: Start with #1 (Exposed API Keys) - takes 30 minutes and is CRITICAL.

