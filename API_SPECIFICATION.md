# Crown Bingo - API Specification

## Overview

This document defines the REST API architecture for the Crown Bingo system. Since the system uses Firebase as the backend, this specification outlines:

1. **Firebase Direct Integration** - How applications use Firestore directly
2. **Recommended API Layer** - Node.js/Express backend for unified access
3. **Authentication Flow** - JWT tokens and Firebase Auth integration
4. **Data Synchronization** - Cross-project and real-time updates

---

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [WebSocket/Real-time](#websocketreal-time)
7. [Implementation Guide](#implementation-guide)

---

## Architecture

### Current Setup (Firebase Direct)
```
┌─────────────────────┐
│   Applications      │
│ - Admin Panel       │
│ - Back Office       │
│ - User App          │
└──────────┬──────────┘
           │ Direct Firestore
           │ Connection
           ▼
┌─────────────────────────┐
│  Firebase Projects      │
│ - bingo-27d37           │ (Back Office + User App)
│ - bingo-27d37-5661f     │ (Admin Panel)
└─────────────────────────┘
```

### Recommended Setup (Unified API Layer)
```
┌──────────────────────┐
│   Applications       │
│ - Admin Panel        │
│ - Back Office        │
│ - User App           │
└──────────┬───────────┘
           │ HTTP/REST API
           ▼
┌──────────────────────────────────────┐
│   Node.js/Express API Layer          │
│   - Request Validation               │
│   - Authentication Check             │
│   - Authorization Verification       │
│   - Data Transformation              │
│   - Cross-project Routing            │
│   - Logging & Audit Trail            │
└──────────┬─────────────┬──────────────┘
           │             │
      Firebase        Firebase
      Project 1       Project 2
       (bingo-27d37)  (bingo-27d37-5661f)
```

---

## Authentication

### Firebase Authentication Flow

```
1. User Credentials
   ↓
2. Firebase Auth (Email/Password)
   ↓
3. Firebase Returns:
   - UID (User ID)
   - ID Token (JWT)
   - Refresh Token
   ↓
4. Store in LocalStorage
   - uid: "firebase-user-id"
   - idToken: "jwt-token"
   ↓
5. Use for API Requests
   - Header: Authorization: Bearer {idToken}
```

### Token Validation

**Custom Claims in Firebase Auth:**

```javascript
// Super Admin
{
  "admin": true,
  "role": "SUPER_ADMIN"
}

// Super Agent
{
  "agent": true,
  "role": "SUPER_AGENT",
  "agentId": "agent-uid"
}

// End User (no special claims)
{
  "role": "USER"
}
```

### API Authentication Header

```
Authorization: Bearer {idToken}
X-User-ID: {uid}
X-Custom-Claims: {custom-claims-json}
```

---

## API Endpoints

### Base URLs

```
Admin Panel:    http://localhost:3000/api
Back Office:    http://localhost:8000/api
User App:       http://localhost:8000/api

(In production, use single domain for all)
```

---

## User Management Endpoints

### 1. Create User

**Endpoint**: `POST /api/users`

**Access**: Super Admin, Super Agent

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "initialBalance": 1000,
  "tempPassword": "TempPass123!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid",
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "balance": 1000,
    "isActive": true,
    "isDisabled": false,
    "createdAt": "2026-05-30T10:00:00Z",
    "createdBy": "admin-uid"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "INVALID_EMAIL",
  "message": "Email format is invalid"
}
```

---

### 2. Get User

**Endpoint**: `GET /api/users/{uid}`

**Access**: Super Admin, Super Agent (own users), User (self)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid",
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "balance": 1000,
    "isActive": true,
    "isDisabled": false,
    "createdAt": "2026-05-30T10:00:00Z",
    "lastLogin": "2026-05-30T14:30:00Z",
    "totalBets": 150,
    "totalWinnings": 2500
  }
}
```

---

### 3. List Users

**Endpoint**: `GET /api/users`

**Access**: Super Admin, Super Agent (own users)

**Query Parameters**:
```
?page=1&limit=20&search=john&sortBy=createdAt&sortOrder=desc
?status=active|inactive|disabled
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "uid": "user-1",
      "username": "john_doe",
      "email": "john@example.com",
      "balance": 1000,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### 4. Update User

**Endpoint**: `PUT /api/users/{uid}`

**Access**: Super Admin, Super Agent (own users), User (self)

**Request Body**:
```json
{
  "username": "john_doe_updated",
  "phone": "0987654321",
  "email": "newemail@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid",
    "username": "john_doe_updated",
    "email": "newemail@example.com",
    "phone": "0987654321",
    "updatedAt": "2026-05-30T15:00:00Z"
  }
}
```

---

### 5. Delete User

**Endpoint**: `DELETE /api/users/{uid}`

**Access**: Super Admin only

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 6. Disable/Enable User

**Endpoint**: `PATCH /api/users/{uid}/status`

**Access**: Super Admin, Super Agent

**Request Body**:
```json
{
  "action": "disable",
  "reason": "Account suspended"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid",
    "isDisabled": true,
    "disabledAt": "2026-05-30T15:00:00Z",
    "disabledReason": "Account suspended"
  }
}
```

---

## Agent Management Endpoints

### 1. Create Agent

**Endpoint**: `POST /api/agents`

**Access**: Super Admin only

**Request Body**:
```json
{
  "agentName": "Agent John",
  "agentCode": "AGT001",
  "email": "agent@example.com",
  "phone": "1234567890",
  "commissionRate": 5.5
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "uid": "agent-uid",
    "agentName": "Agent John",
    "agentCode": "AGT001",
    "email": "agent@example.com",
    "phone": "1234567890",
    "commissionRate": 5.5,
    "isActive": true,
    "totalSales": 0,
    "totalEarnings": 0,
    "createdAt": "2026-05-30T10:00:00Z"
  }
}
```

---

### 2. Get Agent

**Endpoint**: `GET /api/agents/{uid}`

**Access**: Super Admin, Agent (self)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "agent-uid",
    "agentName": "Agent John",
    "agentCode": "AGT001",
    "email": "agent@example.com",
    "commissionRate": 5.5,
    "isActive": true,
    "totalSales": 50000,
    "totalEarnings": 2750,
    "totalUsersCreated": 120,
    "activeUsers": 95,
    "lastActivityAt": "2026-05-30T16:00:00Z"
  }
}
```

---

### 3. List Agents

**Endpoint**: `GET /api/agents`

**Access**: Super Admin only

**Query Parameters**:
```
?page=1&limit=20&sortBy=totalEarnings&status=active
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "uid": "agent-1",
      "agentName": "Agent John",
      "agentCode": "AGT001",
      "commissionRate": 5.5,
      "totalEarnings": 2750,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 4. Update Agent

**Endpoint**: `PUT /api/agents/{uid}`

**Access**: Super Admin only

**Request Body**:
```json
{
  "commissionRate": 6,
  "phone": "0987654321"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "uid": "agent-uid",
    "commissionRate": 6,
    "phone": "0987654321",
    "updatedAt": "2026-05-30T15:00:00Z"
  }
}
```

---

## Transaction Endpoints

### 1. Create Transaction (Recharge Wallet)

**Endpoint**: `POST /api/transactions/recharge`

**Access**: Super Admin, Super Agent (own users)

**Request Body**:
```json
{
  "userId": "user-uid",
  "amount": 500,
  "description": "Wallet recharge for new account"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-uid",
    "userId": "user-uid",
    "type": "RECHARGE",
    "amount": 500,
    "balanceBefore": 1000,
    "balanceAfter": 1500,
    "processedBy": "agent-uid",
    "timestamp": "2026-05-30T15:00:00Z",
    "status": "COMPLETED"
  }
}
```

---

### 2. Get Transaction History

**Endpoint**: `GET /api/transactions`

**Access**: Super Admin, Super Agent, User (own)

**Query Parameters**:
```
?userId={uid}&type=RECHARGE|BET|WIN|WITHDRAWAL
?startDate=2026-05-01&endDate=2026-05-31
?page=1&limit=50
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "txn-1",
      "userId": "user-uid",
      "type": "RECHARGE",
      "amount": 500,
      "balanceBefore": 1000,
      "balanceAfter": 1500,
      "timestamp": "2026-05-30T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

---

### 3. Get User Balance

**Endpoint**: `GET /api/users/{uid}/balance`

**Access**: Super Admin, Super Agent (own users), User (self)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "user-uid",
    "currentBalance": 1500,
    "totalDeposited": 5000,
    "totalBets": 3200,
    "totalWinnings": 2500,
    "lastUpdated": "2026-05-30T15:00:00Z"
  }
}
```

---

## Game Endpoints

### 1. Create Game

**Endpoint**: `POST /api/games`

**Access**: User only

**Request Body**:
```json
{
  "betAmount": 100,
  "selectedNumbers": [1, 2, 3, 4, 5]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "gameId": "game-uid",
    "userId": "user-uid",
    "betAmount": 100,
    "selectedNumbers": [1, 2, 3, 4, 5],
    "status": "PLAYING",
    "startedAt": "2026-05-30T15:00:00Z",
    "createdAt": "2026-05-30T15:00:00Z"
  }
}
```

---

### 2. Complete Game

**Endpoint**: `POST /api/games/{gameId}/complete`

**Access**: User only

**Request Body**:
```json
{
  "drawnNumbers": [1, 2, 5, 8, 10, 15, 20],
  "matchedCount": 3
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "gameId": "game-uid",
    "userId": "user-uid",
    "result": "WIN",
    "matchedCount": 3,
    "winAmount": 250,
    "newBalance": 1750,
    "completedAt": "2026-05-30T15:05:00Z"
  }
}
```

---

### 3. Get Game History

**Endpoint**: `GET /api/games/history`

**Access**: User (own), Super Admin, Super Agent

**Query Parameters**:
```
?userId={uid}&limit=20&page=1&status=COMPLETED|PLAYING
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "gameId": "game-1",
      "betAmount": 100,
      "result": "WIN",
      "winAmount": 250,
      "playedAt": "2026-05-30T15:00:00Z",
      "duration": 300
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

## Dashboard & Analytics Endpoints

### 1. Get Dashboard Stats

**Endpoint**: `GET /api/dashboard/stats`

**Access**: Super Admin only

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 5000,
    "activeUsers": 3500,
    "totalAgents": 45,
    "activeAgents": 40,
    "totalBets": 125000,
    "totalRevenue": 250000,
    "totalWinnings": 150000,
    "netProfit": 100000,
    "averageBetAmount": 2.0,
    "timestamp": "2026-05-30T16:00:00Z"
  }
}
```

---

### 2. Get Agent Analytics

**Endpoint**: `GET /api/analytics/agents/{agentId}`

**Access**: Super Admin, Agent (self)

**Query Parameters**:
```
?startDate=2026-05-01&endDate=2026-05-31&period=daily|weekly|monthly
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "agentId": "agent-uid",
    "agentName": "Agent John",
    "period": {
      "startDate": "2026-05-01",
      "endDate": "2026-05-31"
    },
    "metrics": {
      "totalSales": 50000,
      "totalEarnings": 2750,
      "totalUsersCreated": 120,
      "activeUsers": 95,
      "totalTransactions": 500,
      "averageTransactionValue": 100
    },
    "dailyBreakdown": [
      {
        "date": "2026-05-30",
        "sales": 1500,
        "earnings": 82.50,
        "usersCreated": 5,
        "transactions": 15
      }
    ]
  }
}
```

---

## Settings Endpoints

### 1. Get System Settings

**Endpoint**: `GET /api/settings`

**Access**: Super Admin only

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "maintenanceMode": false,
    "contactEmail": "support@crownbingo.com",
    "contactPhone": "1-800-BINGO",
    "maxBet": 5000,
    "minBet": 10,
    "maxUsers": 10000,
    "registrationEnabled": true,
    "defaultCommissionRate": 5,
    "updatedAt": "2026-05-30T14:00:00Z",
    "updatedBy": "admin-uid"
  }
}
```

---

### 2. Update System Settings

**Endpoint**: `PUT /api/settings`

**Access**: Super Admin only

**Request Body**:
```json
{
  "maintenanceMode": true,
  "maxBet": 10000,
  "defaultCommissionRate": 6
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "maintenanceMode": true,
    "maxBet": 10000,
    "defaultCommissionRate": 6,
    "updatedAt": "2026-05-30T16:00:00Z"
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "issue": "Detailed information about the error"
  },
  "timestamp": "2026-05-30T16:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | User/Agent created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User/Agent/Resource doesn't exist |
| 409 | Conflict | Email already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

```
INVALID_EMAIL              - Email format invalid
EMAIL_ALREADY_EXISTS       - Email already registered
INVALID_PHONE              - Phone format invalid
INSUFFICIENT_BALANCE       - Not enough balance for transaction
USER_DISABLED              - User account is disabled
USER_NOT_FOUND             - User doesn't exist
UNAUTHORIZED               - Not authenticated
FORBIDDEN                  - Insufficient permissions
INVALID_TOKEN              - Token expired or invalid
AGENT_NOT_FOUND            - Agent doesn't exist
INVALID_COMMISSION_RATE    - Commission rate out of range
MAINTENANCE_MODE_ACTIVE    - System in maintenance
DUPLICATE_AGENT_CODE       - Agent code already exists
```

---

## Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1672531200
```

### Rate Limit Rules

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| User Management | 100 requests | 1 hour |
| Transactions | 50 requests | 1 hour |
| Games | 200 requests | 1 hour |
| Dashboard | 30 requests | 1 hour |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 3600 seconds.",
  "retryAfter": 3600
}
```

---

## WebSocket/Real-time

### Real-time Events

```javascript
// Connect to WebSocket
const socket = new WebSocket('ws://localhost:8000/api/ws?token=idToken');

// Listen for events
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'BALANCE_UPDATED':
      // User balance changed
      break;
    case 'ACCOUNT_DISABLED':
      // User account disabled
      break;
    case 'TRANSACTION_COMPLETED':
      // Transaction completed
      break;
    case 'GAME_RESULT':
      // Game result
      break;
  }
});
```

### Event Types

```javascript
// Balance Update Event
{
  "type": "BALANCE_UPDATED",
  "userId": "user-uid",
  "newBalance": 1500,
  "timestamp": "2026-05-30T16:00:00Z"
}

// Account Disabled Event
{
  "type": "ACCOUNT_DISABLED",
  "userId": "user-uid",
  "reason": "Account suspended",
  "timestamp": "2026-05-30T16:00:00Z"
}

// Transaction Completed Event
{
  "type": "TRANSACTION_COMPLETED",
  "transactionId": "txn-uid",
  "userId": "user-uid",
  "amount": 500,
  "type": "RECHARGE",
  "timestamp": "2026-05-30T16:00:00Z"
}

// Game Result Event
{
  "type": "GAME_RESULT",
  "gameId": "game-uid",
  "userId": "user-uid",
  "result": "WIN",
  "winAmount": 250,
  "newBalance": 1750,
  "timestamp": "2026-05-30T16:00:00Z"
}
```

---

## Implementation Guide

### Option 1: Firebase Direct Integration (Current)

**Pros:**
- No backend server needed
- Real-time updates automatically
- Lower cost
- Less complexity

**Cons:**
- Firestore rules must be very restrictive
- No centralized logging
- Cross-project operations difficult
- Limited request validation

**Setup:**
```javascript
// In each application, use Firebase SDK directly
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';

// Query users
const usersRef = collection(db, 'users');
const snapshot = await getDocs(usersRef);
```

---

### Option 2: Node.js/Express API Layer (Recommended)

**Pros:**
- Centralized authentication/authorization
- Audit logging capability
- Rate limiting enforcement
- Cross-project data sync
- Request validation
- Better security

**Cons:**
- Need to maintain backend server
- Additional latency
- More infrastructure cost

**Setup:**

1. **Install Dependencies**
```bash
npm init -y
npm install express firebase-admin cors dotenv axios
npm install --save-dev nodemon
```

2. **Initialize Firebase Admin SDK**
```bash
# Generate service account key from Firebase Console
# Save as serviceAccountKey.json
```

3. **Create .env**
```
PORT=5000
FIREBASE_PROJECT_ID=bingo-27d37
FIREBASE_PROJECT_ID_2=bingo-27d37-5661f
NODE_ENV=development
```

4. **Create server.js**
```javascript
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'No authentication token provided'
    });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    });
  }
};

// Routes
app.use('/api/users', authenticate, require('./routes/users'));
app.use('/api/agents', authenticate, require('./routes/agents'));
app.use('/api/transactions', authenticate, require('./routes/transactions'));

app.listen(process.env.PORT, () => {
  console.log(`API Server running on port ${process.env.PORT}`);
});
```

5. **Create routes/users.js**
```javascript
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// Create User
router.post('/', async (req, res) => {
  try {
    const { username, email, phone, initialBalance } = req.body;
    
    // Validation
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Username and email are required'
      });
    }
    
    // Check authorization (only admin/agent)
    const customClaims = req.user.custom_claims || {};
    if (!customClaims.admin && !customClaims.agent) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }
    
    // Create Firebase user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: 'TempPassword123!'
    });
    
    // Create Firestore document
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: username,
      email: email,
      phone: phone || '',
      balance: initialBalance || 0,
      isActive: true,
      isDisabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    });
    
    res.status(201).json({
      success: true,
      data: {
        uid: userRecord.uid,
        username,
        email,
        phone,
        balance: initialBalance || 0,
        isActive: true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
});

module.exports = router;
```

---

## Testing API Endpoints

### Using cURL

```bash
# Get Users
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/users

# Create User
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","initialBalance":1000}' \
  http://localhost:5000/api/users

# Recharge User
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-uid","amount":500}' \
  http://localhost:5000/api/transactions/recharge
```

### Using Postman

1. Create collection: "Crown Bingo API"
2. Add requests for each endpoint
3. Set Authorization header to Bearer token
4. Test various scenarios

### Using Node.js

```javascript
const fetch = require('node-fetch');

async function getUsers(token) {
  const response = await fetch('http://localhost:5000/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## Security Best Practices

1. **Token Management**
   - Store tokens securely (not in plain localStorage)
   - Implement token refresh logic
   - Set token expiration to 1 hour

2. **Rate Limiting**
   - Implement at API gateway level
   - Use Redis for distributed rate limiting
   - Monitor abuse patterns

3. **Input Validation**
   - Validate all inputs server-side
   - Use type checking
   - Sanitize data before storing

4. **Firestore Rules**
   ```
   match /users/{userId} {
     allow read, write: if request.auth != null && 
       (request.auth.uid == userId || 
        request.auth.token.admin == true);
   }
   ```

5. **Logging & Monitoring**
   - Log all admin actions
   - Monitor for suspicious activity
   - Implement alerts for anomalies

---

## Performance Optimization

1. **Pagination**
   - Always paginate list endpoints
   - Default limit: 20, max: 100

2. **Filtering**
   - Use query parameters for filtering
   - Create composite Firestore indexes

3. **Caching**
   - Cache settings at application level
   - Invalidate on updates

4. **Batch Operations**
   - Use batch writes for multiple operations
   - Limit batch size to 500 operations

---

## Migration Path

### Phase 1 (Current)
- Firebase direct integration
- Applications connect directly to Firestore

### Phase 2 (Recommended)
- Deploy Node.js API layer
- Update applications to use API
- Maintain Firebase fallback

### Phase 3
- Implement Redis caching
- Add advanced logging
- Deploy to production servers

---

**API Specification Version**: 1.0  
**Last Updated**: May 30, 2026  
**Status**: Production Ready  
