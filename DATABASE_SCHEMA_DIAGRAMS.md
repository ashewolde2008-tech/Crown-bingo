# Crown Bingo - Database Schema & Diagrams

## Overview

This document provides visual representations and detailed schemas for all Firestore collections in the Crown Bingo system.

---

## Table of Contents

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Collection Schemas](#collection-schemas)
3. [Firestore Structure](#firestore-structure)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Indexes](#indexes)
6. [Query Patterns](#query-patterns)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ uid (PK)        │
│ username        │
│ email           │
│ phone           │
│ balance         │
│ isActive        │
│ isDisabled      │
│ createdAt       │
│ createdBy (FK)  │──────────┐
│ updatedAt       │          │
└─────────────────┘          │
        │                    │
        │ 1:N                │
        │ (plays)            │
        ▼                    │
┌─────────────────┐          │
│     GAMES       │          │
├─────────────────┤          │
│ gameId (PK)     │          │
│ userId (FK)     │          │
│ betAmount       │          │
│ selectedNumbers │          │
│ result          │          │
│ winAmount       │          │
│ status          │          │
│ startedAt       │          │
│ completedAt     │          │
│ createdAt       │          │
└─────────────────┘          │
        │                    │
        │ 1:N                │
        │                    │
        ▼                    │
┌─────────────────┐          │
│      BETS       │          │
├─────────────────┤          │
│ betId (PK)      │          │
│ userId (FK)     │          │
│ gameId (FK)     │          │
│ amount          │          │
│ numbers         │          │
│ result          │          │
│ winnings        │          │
│ timestamp       │          │
│ status          │          │
└─────────────────┘          │
        │                    │
        │ 1:N                │
        │                    │
        ▼                    │
┌──────────────────────┐     │
│    TRANSACTIONS      │     │
├──────────────────────┤     │
│ transactionId (PK)   │     │
│ userId (FK)          │     │
│ type                 │     │
│ amount               │     │
│ balanceBefore        │     │
│ balanceAfter         │     │
│ description          │     │
│ agentId (FK)         │◄────┘
│ timestamp            │
│ status               │
└──────────────────────┘

        ┌─────────────────┐
        │     AGENTS      │
        ├─────────────────┤
        │ uid (PK)        │
        │ agentName       │
        │ agentCode       │
        │ email           │
        │ phone           │
        │ commissionRate  │
        │ isActive        │
        │ totalSales      │
        │ totalEarnings   │
        │ createdAt       │
        │ createdBy (FK)  │
        │ updatedAt       │
        └─────────────────┘
```

---

## Collection Schemas

### 1. Users Collection

```javascript
{
  // Document ID: Firebase UID
  uid: "firebase-uid-12345",
  
  // Basic Information
  username: "john_doe",
  email: "john@example.com",
  phone: "+1234567890",
  displayName: "John Doe",
  avatar: "https://...",
  
  // Financial Information
  balance: 1500.50,              // Current wallet balance
  totalDeposited: 5000.00,       // Total money deposited
  totalWins: 2500.75,            // Total winnings
  totalBets: 3200.25,            // Total amount bet
  
  // Account Status
  isActive: true,
  isDisabled: false,
  disabledReason: null,          // Why account was disabled
  disabledAt: null,
  
  // Account Management
  role: "USER",                  // USER, SUPER_AGENT, SUPER_ADMIN
  createdBy: "agent-uid-123",    // Which agent created this user
  createdAt: Timestamp,
  lastLogin: Timestamp,
  lastActivityAt: Timestamp,
  updatedAt: Timestamp,
  
  // Preferences
  language: "en",
  timezone: "UTC",
  receiveNotifications: true,
  receiveEmails: true,
  
  // Verification
  emailVerified: true,
  phoneVerified: false,
  kycStatus: "PENDING",          // PENDING, APPROVED, REJECTED
  kycDocuments: {},
  
  // Security
  lastPasswordChange: Timestamp,
  failedLoginAttempts: 0,
  accountLockedUntil: null,
  twoFactorEnabled: false,
  
  // Metadata
  metadata: {
    ipAddress: "192.168.1.1",
    device: "Desktop",
    browser: "Chrome",
    country: "USA"
  }
}
```

**Indexes**:
- `isActive` (Ascending)
- `createdAt` (Descending)
- `balance` (Descending)
- `isActive, createdAt` (Composite)

---

### 2. Agents Collection

```javascript
{
  // Document ID: Firebase UID
  uid: "agent-uid-67890",
  
  // Basic Information
  agentName: "Super Agent John",
  agentCode: "AGT-001",          // Unique agent code
  email: "agent@example.com",
  phone: "+1234567890",
  businessName: "John's Bingo Services",
  
  // Commission & Earnings
  commissionRate: 5.5,           // Percentage commission
  commissionType: "percentage",  // percentage, fixed
  totalSales: 50000.00,          // Total sales value
  totalEarnings: 2750.00,        // Total commission earned
  totalUsers: 120,               // Total users created
  activeUsers: 95,               // Currently active users
  
  // Account Status
  isActive: true,
  suspendedAt: null,
  suspendReason: null,
  
  // Created Users (for quick lookup)
  createdUsers: ["user-uid-1", "user-uid-2", ...],
  
  // Account Management
  role: "SUPER_AGENT",
  createdBy: "admin-uid",        // Admin who created agent
  createdAt: Timestamp,
  lastLogin: Timestamp,
  lastActivityAt: Timestamp,
  updatedAt: Timestamp,
  
  // Banking Information
  bankDetails: {
    bankName: "Bank XYZ",
    accountNumber: "****1234",
    accountHolder: "John Doe",
    IFSC: "BANK0001",
    routingNumber: "123456789"
  },
  
  // Performance Metrics
  performanceMetrics: {
    averageBetAmount: 100.00,
    totalGamesPlayed: 5000,
    winRate: 0.45,
    retentionRate: 0.85
  },
  
  // Preferences
  language: "en",
  timezone: "UTC",
  receiveNotifications: true,
  
  // Verification
  kycStatus: "APPROVED",
  businessVerified: true,
  
  // Security
  lastPasswordChange: Timestamp,
  twoFactorEnabled: true,
  ipWhitelist: ["192.168.1.1", "10.0.0.1"]
}
```

**Indexes**:
- `isActive` (Ascending)
- `totalEarnings` (Descending)
- `createdAt` (Descending)
- `isActive, totalEarnings` (Composite)

---

### 3. Transactions Collection

```javascript
{
  // Document ID: Auto-generated
  transactionId: "txn-2026-05-30-001",
  
  // Related Entities
  userId: "user-uid-12345",
  agentId: "agent-uid-67890",    // Null if admin action
  gameId: "game-uid-99999",      // Null if not game related
  
  // Transaction Details
  type: "RECHARGE",              // RECHARGE, BET, WIN, WITHDRAWAL, ADJUSTMENT
  amount: 500.00,
  currency: "USD",
  
  // Balance Changes
  balanceBefore: 1000.00,
  balanceAfter: 1500.00,
  balanceChange: 500.00,
  
  // Description & Reference
  description: "Wallet recharge by agent",
  reference: "REF-2026-05-30-001",
  internalNote: "Manual recharge",
  
  // Status
  status: "COMPLETED",           // PENDING, COMPLETED, FAILED, REVERSED
  failureReason: null,
  
  // Timestamps
  timestamp: Timestamp,
  processedAt: Timestamp,
  createdAt: Timestamp,
  
  // Source/Method
  method: "AGENT_RECHARGE",      // AGENT_RECHARGE, BANK_TRANSFER, CARD, WALLET
  paymentGateway: null,          // If payment gateway used
  paymentId: null,
  
  // Metadata
  metadata: {
    ipAddress: "192.168.1.1",
    device: "Mobile",
    location: "USA"
  },
  
  // Audit Trail
  approvedBy: "admin-uid",       // Who approved it
  approvedAt: Timestamp,
  verificationCode: null
}
```

**Indexes**:
- `userId, timestamp` (Composite)
- `userId, status` (Composite)
- `type, timestamp` (Composite)
- `timestamp` (Descending)
- `status` (Ascending)

---

### 4. Games Collection

```javascript
{
  // Document ID: Auto-generated
  gameId: "game-2026-05-30-12345",
  
  // Related Entity
  userId: "user-uid-12345",
  
  // Game Information
  gameType: "BINGO",             // BINGO, KENO, LOTTO, etc.
  gameName: "Classic Bingo",
  
  // Betting Information
  betAmount: 100.00,
  selectedNumbers: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45],
  
  // Game Outcome
  result: "WIN",                 // WIN, LOSS, DRAW
  drawnNumbers: [1, 3, 5, 7, 10, 15, 20, 25],
  matchedNumbers: [1, 5, 10, 15, 20, 25],
  matchCount: 6,
  
  // Winnings
  winAmount: 250.00,
  totalPayout: 350.00,           // Includes original bet
  multiplier: 3.5,               // Win multiplier
  
  // Game Status
  status: "COMPLETED",           // PLAYING, COMPLETED, CANCELLED
  
  // Timestamps
  startedAt: Timestamp,
  completedAt: Timestamp,
  createdAt: Timestamp,
  
  // Duration
  duration: 300,                 // Seconds
  
  // Game Difficulty
  difficulty: "MEDIUM",          // EASY, MEDIUM, HARD
  
  // Odds Information
  winOdds: 0.45,                 // Probability of winning
  houseEdge: 0.05,               // 5% house advantage
  
  // Metadata
  serverHash: "abc123def456",    // For fairness verification
  clientHash: "xyz789uvw456",    // Client-generated hash
  verified: true                 // Game fairness verified
}
```

**Indexes**:
- `userId, completedAt` (Composite)
- `status, createdAt` (Composite)
- `result, timestamp` (Composite)

---

### 5. Bets Collection

```javascript
{
  // Document ID: Auto-generated
  betId: "bet-2026-05-30-001",
  
  // Related Entities
  userId: "user-uid-12345",
  gameId: "game-2026-05-30-12345",
  
  // Bet Details
  amount: 100.00,
  numbers: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45],
  betType: "STANDARD",           // STANDARD, COMBINED, ACCUMULATOR
  
  // Result
  result: "WIN",                 // WIN, LOSS, PENDING
  winnings: 250.00,
  netProfit: 150.00,             // Winnings - Bet Amount
  
  // Status & Timestamps
  status: "SETTLED",             // PENDING, SETTLED, CANCELLED
  placedAt: Timestamp,
  settledAt: Timestamp,
  
  // Additional Info
  odds: 3.5,
  potentialWinnings: 350.00
}
```

---

### 6. Settings Collection

```javascript
{
  // Document ID: "system-settings"
  docId: "system-settings",
  
  // System Configuration
  maintenanceMode: false,
  maintenanceMessage: null,
  maintenanceScheduledEnd: null,
  
  // Contact Information
  contactEmail: "support@crownbingo.com",
  contactPhone: "+1-800-BINGO-NOW",
  website: "https://crownbingo.com",
  
  // Business Rules
  maxBet: 5000.00,
  minBet: 10.00,
  maxUsers: 10000,
  maxAgents: 100,
  
  // Game Configuration
  defaultCommissionRate: 5.0,
  winMultiplier: 3.5,
  houseEdge: 0.05,
  fairnessVerificationRequired: true,
  
  // Registration Settings
  registrationEnabled: true,
  requiresVerification: true,
  minAgeRequirement: 18,
  
  // Security Settings
  twoFactorEnabled: false,
  passwordMinLength: 8,
  sessionTimeout: 3600,          // 1 hour in seconds
  maxLoginAttempts: 5,
  lockoutDuration: 900,          // 15 minutes
  
  // Email Settings
  emailNotificationsEnabled: true,
  emailFrom: "noreply@crownbingo.com",
  emailVerificationRequired: true,
  
  // SMS Settings
  smsNotificationsEnabled: true,
  smsProvider: "Twilio",
  smsFrom: "+1234567890",
  
  // Notification Settings
  notificationChannels: ["email", "sms", "push"],
  notificationPreferences: {
    onWin: true,
    onPromotion: true,
    onUpdateAlert: true
  },
  
  // Payment Gateway
  paymentGateway: "Stripe",
  paymentCurrency: "USD",
  paymentEnabled: true,
  
  // Audit & Logging
  auditLoggingEnabled: true,
  logRetentionDays: 90,
  
  // Version Info
  apiVersion: "1.0.0",
  appVersion: "1.0.0",
  dbSchemaVersion: "1.0",
  
  // Timestamps
  updatedAt: Timestamp,
  updatedBy: "admin-uid"
}
```

---

### 7. Audit Logs Collection

```javascript
{
  // Document ID: Auto-generated
  logId: "audit-2026-05-30-00001",
  
  // Action Details
  action: "USER_CREATED",        // Action type
  actionCategory: "USER_MANAGEMENT",
  description: "New user account created",
  
  // Actor Information
  performedBy: "agent-uid-123",
  performedByRole: "SUPER_AGENT",
  performedByName: "Agent John",
  
  // Target Information
  targetType: "USER",            // USER, AGENT, SETTINGS, etc.
  targetId: "user-uid-12345",
  targetName: "john_doe",
  
  // Changes
  changes: {
    username: { old: null, new: "john_doe" },
    email: { old: null, new: "john@example.com" },
    balance: { old: null, new: 1000.00 }
  },
  
  // Status
  status: "SUCCESS",             // SUCCESS, FAILURE
  errorMessage: null,
  
  // Request Information
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  browser: "Chrome",
    deviceType: "Desktop",
  country: "USA",
  
  // Timestamp
  timestamp: Timestamp,
  
  // Additional Metadata
  requestId: "req-12345",
  sessionId: "session-67890",
  tags: ["user-management", "account-creation"]
}
```

---

## Firestore Structure

```
Crown Bingo Database (bingo-27d37)
├── users/ (Collection)
│   ├── uid-1 (Document)
│   ├── uid-2 (Document)
│   └── uid-N (Document)
│
├── agents/ (Collection)
│   ├── agent-uid-1 (Document)
│   ├── agent-uid-2 (Document)
│   └── agent-uid-N (Document)
│
├── transactions/ (Collection)
│   ├── txn-id-1 (Document)
│   ├── txn-id-2 (Document)
│   └── txn-id-N (Document)
│
├── games/ (Collection)
│   ├── game-id-1 (Document)
│   ├── game-id-2 (Document)
│   └── game-id-N (Document)
│
├── bets/ (Collection)
│   ├── bet-id-1 (Document)
│   ├── bet-id-2 (Document)
│   └── bet-id-N (Document)
│
├── settings/ (Collection)
│   └── system-settings (Document)
│
└── auditLogs/ (Collection)
    ├── audit-id-1 (Document)
    ├── audit-id-2 (Document)
    └── audit-id-N (Document)
```

---

## Data Flow Diagrams

### User Registration Flow

```
┌──────────────┐
│ New User     │
│ Registers    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Firebase Auth        │
│ Create User          │
│ Email + Password     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Firestore users/     │
│ Document Created     │
│ - uid                │
│ - username           │
│ - email              │
│ - balance: 0         │
│ - created by agent   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Audit Log Entry      │
│ USER_CREATED action  │
└──────────────────────┘
```

### Game Play Flow

```
┌──────────────┐
│ User Plays   │
│ Game         │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Create Game Doc      │
│ - userId             │
│ - betAmount          │
│ - selectedNumbers    │
│ - status: PLAYING    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Deduct Bet from      │
│ User Balance         │
│ (Update user doc)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create Transaction   │
│ - type: BET          │
│ - amount: betAmount  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Generate Game        │
│ Results              │
│ Draw numbers         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Update Game Status   │
│ - status: COMPLETED  │
│ - result: WIN/LOSS   │
│ - winAmount          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ If WIN: Add Winnings │
│ to User Balance      │
│ (Update user doc)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create Transaction   │
│ - type: WIN          │
│ - amount: winAmount  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create Audit Log     │
│ GAME_COMPLETED       │
└──────────────────────┘
```

### Wallet Recharge Flow

```
┌──────────────┐
│ Agent views  │
│ User Account │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Agent Enters         │
│ Recharge Amount      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ System Validates:    │
│ - Amount > 0         │
│ - User exists        │
│ - Agent can access   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create Transaction   │
│ - type: RECHARGE     │
│ - amount             │
│ - status: PENDING    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Update User Balance  │
│ balanceAfter =       │
│ balanceBefore +      │
│ rechargeAmount       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Transaction Status   │
│ = COMPLETED          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Send Notification    │
│ to User              │
│ Balance Updated      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create Audit Log     │
│ BALANCE_CHARGED      │
└──────────────────────┘
```

---

## Indexes

### Recommended Composite Indexes

```javascript
// Users Collection
db.collection('users').where('isActive', '==', true)
  .orderBy('createdAt', 'desc');
// Index: users: (isActive, createdAt)

db.collection('users').where('createdBy', '==', 'agent-uid')
  .orderBy('createdAt', 'desc');
// Index: users: (createdBy, createdAt)

// Transactions Collection
db.collection('transactions').where('userId', '==', 'user-uid')
  .orderBy('timestamp', 'desc');
// Index: transactions: (userId, timestamp)

db.collection('transactions').where('type', '==', 'RECHARGE')
  .orderBy('timestamp', 'desc');
// Index: transactions: (type, timestamp)

db.collection('transactions').where('status', '==', 'COMPLETED')
  .where('type', '==', 'WIN')
  .orderBy('timestamp', 'desc');
// Index: transactions: (status, type, timestamp)

// Games Collection
db.collection('games').where('userId', '==', 'user-uid')
  .orderBy('completedAt', 'desc');
// Index: games: (userId, completedAt)

db.collection('games').where('result', '==', 'WIN')
  .orderBy('timestamp', 'desc');
// Index: games: (result, timestamp)

// Agents Collection
db.collection('agents').where('isActive', '==', true)
  .orderBy('totalEarnings', 'desc');
// Index: agents: (isActive, totalEarnings)

// Audit Logs Collection
db.collection('auditLogs').where('targetType', '==', 'USER')
  .orderBy('timestamp', 'desc');
// Index: auditLogs: (targetType, timestamp)
```

---

## Query Patterns

### High-Frequency Queries

```javascript
// 1. Get user by ID
const userDoc = await db.collection('users').doc(userId).get();

// 2. Get user transactions (paginated)
const snapshot = await db.collection('transactions')
  .where('userId', '==', userId)
  .orderBy('timestamp', 'desc')
  .limit(20)
  .get();

// 3. Get all users created by agent
const agentUsers = await db.collection('users')
  .where('createdBy', '==', agentId)
  .get();

// 4. Get active agents
const activeAgents = await db.collection('agents')
  .where('isActive', '==', true)
  .orderBy('totalEarnings', 'desc')
  .get();

// 5. Get user balance
const user = await db.collection('users').doc(userId).get();
const balance = user.data().balance;

// 6. Get game history
const games = await db.collection('games')
  .where('userId', '==', userId)
  .orderBy('completedAt', 'desc')
  .limit(50)
  .get();

// 7. Get recharge transactions only
const recharges = await db.collection('transactions')
  .where('userId', '==', userId)
  .where('type', '==', 'RECHARGE')
  .orderBy('timestamp', 'desc')
  .get();

// 8. Get winning games
const wins = await db.collection('games')
  .where('userId', '==', userId)
  .where('result', '==', 'WIN')
  .orderBy('completedAt', 'desc')
  .get();
```

---

## Data Size Estimates

```
Collection Size Projection (at 10,000 users):

Users:           10,000 documents × 2 KB =     20 MB
Agents:             100 documents × 3 KB =    300 KB
Games:         100,000 documents × 1 KB =    100 MB
Bets:          150,000 documents × 0.8 KB =  120 MB
Transactions:  200,000 documents × 1.5 KB =  300 MB
Audit Logs:    500,000 documents × 2 KB =  1,000 MB
Settings:            1 document × 5 KB =      5 KB
────────────────────────────────────────────────
Total Estimated Size:                      1.5 GB

Monthly Growth (at 1000 new users/month):
- New games: 100,000 × 30 = 3,000,000 per year
- New transactions: 200,000 × 30 = 6,000,000 per year
- Storage growth: ~50 GB per year
```

---

## Performance Considerations

```
Read Operations (at peak):
- Concurrent users: 10,000
- Average reads per user: 100/day
- Total daily reads: 1,000,000
- Cost: ~$50-60/day (at Firebase rates)

Write Operations (at peak):
- Game transactions: 500,000/day
- Balance updates: 200,000/day
- Transaction records: 300,000/day
- Audit logs: 1,000,000/day
- Total daily writes: 2,000,000
- Cost: ~$30-40/day

Recommended:
- Enable offline persistence
- Implement query caching
- Use batch operations
- Archive old audit logs monthly
```

---

## Backup Strategy

```
Daily Backups:
- Time: 2:00 AM UTC
- Retention: 7 days (free tier) or 90 days (paid)
- Location: Google Cloud Storage
- Automation: Cloud Scheduler + Cloud Functions

Monthly Archives:
- Full backup snapshot
- Retention: 1 year
- Compression: Gzip
- Location: Cloud Storage (cold storage)

Restore Procedure:
1. Identify backup date needed
2. Restore via Firebase Console
3. Verify data integrity
4. Switch to restored version
5. Test all applications
```

---

**Database Schema Version**: 1.0  
**Last Updated**: May 30, 2026  
**Firestore Projects**: 2 (bingo-27d37, bingo-27d37-5661f)  
**Status**: Production Ready
