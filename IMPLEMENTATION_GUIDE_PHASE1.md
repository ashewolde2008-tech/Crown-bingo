# Crown Bingo - Production Readiness Implementation Guide
**Target Completion**: 6 weeks  
**Team Size**: 2-3 senior engineers  
**Success Criteria**: Phase 1 (Security) 100% complete, Phase 2 (Resilience) 80% complete before production  

---

## Phase 1: Security Hardening (Weeks 1-2)

### 1.1 Credential Management

**Task 1.1.1: Rotate Firebase Keys**
```bash
# Timeline: 30 minutes
# Risk: CRITICAL

# Action 1: Generate new API key
# Firebase Console > Project Settings > Service Accounts > Create new private key
# Save as admin-panel/serviceAccountKey.json.NEW

# Action 2: Update firebaseConfig
# Commit ONLY the new keys to .env files

# Action 3: Disable old keys immediately
# Firebase Console > APIs & services > Credentials > Disable old keys

# Action 4: Verify no compromise
# Firebase Console > Audit logs
# Check for unauthorized access in last 24 hours

# Action 5: Setup monitoring
# Create alert: Firestore reads > 10000/minute
# Create alert: Authentication failures > 50/minute
```

**Task 1.1.2: Environment Variable Configuration**

Create three environment files:

```bash
# admin-panel/.env.development
REACT_APP_ENV=development
REACT_APP_FIREBASE_API_KEY=<dev-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bingo-27d37-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=bingo-27d37-dev.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<dev-id>
REACT_APP_FIREBASE_APP_ID=<dev-app-id>
REACT_APP_API_URL=http://localhost:5000

# admin-panel/.env.staging
REACT_APP_ENV=staging
REACT_APP_FIREBASE_API_KEY=<staging-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37-staging.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bingo-27d37-staging
REACT_APP_API_URL=https://api-staging.crownbingo.com

# admin-panel/.env.production
REACT_APP_ENV=production
REACT_APP_FIREBASE_API_KEY=<prod-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=bingo-27d37.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bingo-27d37
REACT_APP_API_URL=https://api.crownbingo.com
```

Update `.gitignore`:
```bash
# .gitignore additions
.env
.env.local
.env.*.local
.env.production
firebaseConfig.js  # If still using hardcoded config
```

Update Firebase initialization:
```javascript
// admin-panel/src/firebase.js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration incomplete. Check .env file.');
}

const app = initializeApp(firebaseConfig);
```

**Netlify Configuration**:
```toml
# admin-panel/netlify.toml (updated)
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  CI = "false"

# Environment-specific build context
[context.production]
  command = "npm run build:production"
  environment = { REACT_APP_ENV = "production" }

[context.staging]
  command = "npm run build:staging"
  environment = { REACT_APP_ENV = "staging" }

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 1.2 Input Validation Framework

**Task 1.2.1: Setup Joi Validation**

```bash
npm install joi --prefix api
```

Create validation schemas:
```javascript
// api/validation/schemas.js
const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(12)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[0-9]/, 'number')
  .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'special')
  .required()
  .messages({
    'string.pattern.name': 'Password must contain {#name} characters'
  });

const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required();

const createUserSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  initialBalance: Joi.number()
    .min(0)
    .max(1000000)
    .required(),
  role: Joi.string()
    .valid('USER', 'SUPER_AGENT', 'SUPER_ADMIN')
    .required()
});

const createAgentSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  agentName: Joi.string().min(2).max(100).required(),
  agentCode: Joi.string().alphanum().min(3).max(20).required().unique(),
  commissionRate: Joi.number().min(0).max(100).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
});

const rechargeWalletSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().min(1).max(100000).required(),
  method: Joi.string().valid('CREDIT_CARD', 'BANK_TRANSFER', 'CASH').required()
});

module.exports = {
  createUserSchema,
  createAgentSchema,
  rechargeWalletSchema,
  emailSchema,
  passwordSchema
};
```

Create validation middleware:
```javascript
// api/middleware/validate.js
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: messages
      });
    }

    req.validatedBody = value;
    next();
  };
}

module.exports = { validate };
```

Apply to routes:
```javascript
// api/routes/users.js
const { validate } = require('../middleware/validate');
const { createUserSchema, createAgentSchema } = require('../validation/schemas');

router.post('/', 
  authenticate, 
  requireRole('SUPER_ADMIN', 'SUPER_AGENT'),
  validate(createUserSchema),
  async (req, res) => {
    try {
      const { email, password, username, phone, initialBalance, role } = req.validatedBody;
      
      // Data is already validated
      const userRecord = await admin.auth().createUser({ email, password });
      
      // ... rest of handler
    } catch (err) {
      // ... error handling
    }
  }
);
```

---

### 1.3 Rate Limiting Implementation

**Task 1.3.1: Setup Redis for Rate Limiting**

```bash
# Install dependencies
npm install express-rate-limit rate-limit-redis redis --prefix api

# For development, use Docker
docker run -d -p 6379:6379 redis:alpine

# For production, use Google Cloud Memorystore
gcloud memorystore instances create crown-bingo-cache \
  --size=1gb \
  --region=us-central1
```

Create rate limiter configuration:
```javascript
// api/config/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

client.on('error', err => console.error('Redis error:', err));

// Rate limiting strategies
const limiters = {
  // Global limit: 100 requests per minute per IP
  global: rateLimit({
    store: new RedisStore({
      client,
      prefix: 'rl:global:'
    }),
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Login limiter: 5 attempts per 15 minutes
  login: rateLimit({
    store: new RedisStore({
      client,
      prefix: 'rl:login:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true,  // Don't count successful logins
    keyGenerator: (req) => req.body.email || req.ip
  }),

  // API limiter: 1000 requests per minute per user
  api: rateLimit({
    store: new RedisStore({
      client,
      prefix: 'rl:api:'
    }),
    windowMs: 60 * 1000,
    max: 1000,
    keyGenerator: (req) => req.user?.uid || req.ip
  }),

  // Strict limiter: 10 requests per minute for sensitive operations
  strict: rateLimit({
    store: new RedisStore({
      client,
      prefix: 'rl:strict:'
    }),
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.user?.uid || req.ip
  })
};

module.exports = { limiters, client };
```

Apply in server:
```javascript
// api/server.js
const express = require('express');
const { limiters } = require('./config/rateLimiter');

const app = express();

// Global limit on all routes
app.use(limiters.global);

// Specific limits on sensitive endpoints
app.post('/auth/login', limiters.login, authController.login);
app.post('/auth/signup', limiters.login, authController.signup);
app.post('/api/users', limiters.strict, userController.createUser);
app.delete('/api/users/:id', limiters.strict, userController.deleteUser);

// Standard API limit
app.use('/api/', limiters.api);
```

**Testing**:
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
done
# Should see "Too many requests" after 5 attempts
```

---

### 1.4 Firestore Security Rules Enhancement

**Task 1.4.1: Update Rules with Financial Validation**

```javascript
// firestore.rules (complete rewrite)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return request.auth.token.role;
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserRole() == 'SUPER_ADMIN';
    }

    function isSuperAgent() {
      return isAuthenticated() && getUserRole() == 'SUPER_AGENT';
    }

    function isUser() {
      return isAuthenticated() && getUserRole() == 'USER';
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function validateAmount(min, max) {
      return request.resource.data.amount >= min && 
             request.resource.data.amount <= max;
    }

    function validateStatus(allowedStatuses) {
      return request.resource.data.status in allowedStatuses;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSuperAdmin() || isSuperAgent() || (isUser() && isOwner(userId));
      allow create: if isSuperAdmin() || isSuperAgent();
      allow update: if isSuperAdmin() || isSuperAgent() || (isUser() && isOwner(userId));
      allow delete: if isSuperAdmin();
    }

    // Agents collection
    match /agents/{agentId} {
      allow read: if isSuperAdmin() || isSuperAgent();
      allow create: if isSuperAdmin();
      allow update: if isSuperAdmin() || isSuperAgent();
      allow delete: if isSuperAdmin();
    }

    // Transactions collection - CRITICAL for financial data
    match /transactions/{txnId} {
      allow read: if isSuperAdmin() || 
                     isSuperAgent() || 
                     (isUser() && resource.data.userId == request.auth.uid);
      
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid &&
                       validateAmount(1, 10000) &&  // Between $1 and $10,000
                       validateStatus(['PENDING']) &&
                       request.resource.data.method in ['CREDIT_CARD', 'BANK_TRANSFER'] &&
                       request.resource.data.timestamp == request.time &&
                       !('processed' in request.resource.data);  // Prevent race condition
      
      allow update: if isSuperAdmin() && 
                       (request.resource.data.status in ['COMPLETED', 'FAILED', 'CANCELLED']) &&
                       request.resource.data.processedAt == request.time;
      
      allow delete: if false;  // Transactions are immutable
    }

    // Bets collection - Game betting
    match /bets/{betId} {
      allow read: if isSuperAdmin() || 
                     isSuperAgent() || 
                     (isUser() && resource.data.userId == request.auth.uid);
      
      allow create: if isUser() &&
                       request.resource.data.userId == request.auth.uid &&
                       validateAmount(0.01, 1000) &&  // Bet limits
                       request.resource.data.gameId != null &&
                       request.resource.data.gameId is string &&
                       validateStatus(['ACTIVE']) &&
                       request.resource.data.betNumbers is list &&
                       request.resource.data.betNumbers.size() > 0;
      
      allow update: if isSuperAdmin();
      
      allow delete: if false;
    }

    // Games collection
    match /games/{gameId} {
      allow read: if isSuperAdmin() || 
                     isSuperAgent() || 
                     (isUser() && resource.data.userId == request.auth.uid);
      
      allow create: if isAuthenticated() && 
                       request.resource.data.name is string &&
                       request.resource.data.name.size() > 0;
      
      allow update: if isSuperAdmin();
      
      allow delete: if isSuperAdmin();
    }

    // Settings collection - Admin only
    match /settings/{setting} {
      allow read: if isSuperAdmin();
      allow write: if isSuperAdmin();
    }

    // Audit logs - Admin only, append-only
    match /auditLogs/{logId} {
      allow read: if isSuperAdmin();
      allow create: if request.resource.data.timestamp == request.time;
      allow update, delete: if false;  // Immutable logs
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

Verify:
```bash
firebase rules:test --source firestore.rules --testRules tests/firestore-rules.test.js
```

---

### 1.5 CORS Configuration

**Task 1.5.1: Configure CORS by Environment**

```javascript
// api/config/cors.js
const allowedOrigins = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000',
    '127.0.0.1:3000'
  ],
  staging: [
    'https://staging-admin.crownbingo.com',
    'https://staging-agent.crownbingo.com',
    'https://staging.crownbingo.com'
  ],
  production: [
    'https://admin.crownbingo.com',
    'https://agent.crownbingo.com',
    'https://play.crownbingo.com'
  ]
};

const corsOptions = {
  origin: function (origin, callback) {
    const env = process.env.NODE_ENV || 'development';
    const allowed = allowedOrigins[env];

    if (!origin) {
      // Allow requests with no origin (like mobile apps, Postman)
      return callback(null, true);
    }

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  maxAge: 86400  // 24 hours
};

module.exports = corsOptions;
```

Apply in server:
```javascript
// api/server.js
const cors = require('cors');
const corsOptions = require('./config/cors');

app.use(cors(corsOptions));

// Handle CORS errors
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    res.status(403).json({
      error: 'CORS_ERROR',
      message: err.message
    });
  } else {
    next(err);
  }
});
```

---

### 1.6 Admin Role Server-Side Verification

**Task 1.6.1: Move Admin Checks to Backend**

```javascript
// api/middleware/adminAuth.js
const admin = require('firebase-admin');

async function requireAdminRole(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Missing authorization header'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    // ✅ Server-side admin verification
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    if (userData.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Admin access required'
      });
    }

    // Also verify custom claims as backup
    const customClaims = decoded.role || decoded.custom_claims?.role;
    if (customClaims !== 'SUPER_ADMIN') {
      await admin.auth().setCustomUserClaims(decoded.uid, {
        role: 'SUPER_ADMIN'
      });
    }

    req.user = {
      ...decoded,
      uid: decoded.uid,
      email: decoded.email,
      role: 'SUPER_ADMIN',
      isAdmin: true
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Authentication failed'
    });
  }
}

module.exports = { requireAdminRole };
```

Apply to admin routes:
```javascript
// api/routes/admin/users.js
const { requireAdminRole } = require('../../middleware/adminAuth');

router.get('/', requireAdminRole, async (req, res) => {
  // Only SUPER_ADMIN can access
  const users = await admin.firestore().collection('users').get();
  res.json({ success: true, data: users.docs.map(d => d.data()) });
});

router.post('/', requireAdminRole, validate(createUserSchema), async (req, res) => {
  // Create user logic
});
```

---

## Phase 1 Summary

**Deliverables**:
- ✅ Firebase credentials moved to .env
- ✅ Input validation on all endpoints
- ✅ Rate limiting active
- ✅ Firestore rules with financial validation
- ✅ CORS restricted by environment
- ✅ Admin verification server-side

**Testing Checklist**:
- [ ] Hardcoded keys removed (git history clean)
- [ ] Invalid requests rejected with 400
- [ ] Rate limit triggered at max requests
- [ ] Firestore rules prevent invalid transactions
- [ ] CORS allows staging/production domains
- [ ] Frontend admin check fails without server verification

**Time Estimate**: 5-6 days for experienced team

---

## Phase 2: Resilience Engineering (Weeks 3-4)

[Content continues with detailed implementation for:]
- 2.1 Retry Logic with Exponential Backoff
- 2.2 Circuit Breaker Pattern
- 2.3 Health Checks
- 2.4 Firestore Transactions
- 2.5 Offline Support

*[Full implementation continues in next section...]*

---

## Conclusion

This guide provides step-by-step implementation instructions for hardening the Crown Bingo system. Follow Phase 1 strictly before moving to Phase 2.

**Next**: Proceed to implementation with the detailed code examples and testing procedures outlined above.

