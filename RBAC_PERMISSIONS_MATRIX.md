# Crown Bingo - Role-Based Access Control (RBAC) & Permissions Matrix

## Overview

This document defines all roles, permissions, and access controls for the Crown Bingo system.

---

## Table of Contents

1. [User Roles](#user-roles)
2. [Permission Categories](#permission-categories)
3. [Detailed RBAC Matrix](#detailed-rbac-matrix)
4. [Feature Access Matrix](#feature-access-matrix)
5. [Data Access Rules](#data-access-rules)
6. [API Endpoint Access](#api-endpoint-access)
7. [Firestore Rules](#firestore-rules)
8. [Role Hierarchy](#role-hierarchy)
9. [Permission Management](#permission-management)
10. [Implementation Code](#implementation-code)

---

## User Roles

### 1. Super Admin (SUPER_ADMIN)

**Definition**: System administrator with complete control over all aspects of the system.

**Responsibilities**:
- Manage Super Agent accounts
- Manage all end-user accounts
- Configure system settings
- View system analytics
- Manage admin claims
- Access all databases
- View audit logs
- Set commission rates

**Firebase Custom Claim**:
```json
{
  "admin": true,
  "role": "SUPER_ADMIN",
  "permissions": ["*"]
}
```

**Access Level**: Tier 1 (Highest)

---

### 2. Super Agent (SUPER_AGENT)

**Definition**: Back office operator who manages Crown Bingo user accounts on behalf of the admin.

**Responsibilities**:
- Create new user accounts
- Manage user account details
- Recharge user wallets
- Enable/disable user accounts
- View user transaction history
- View personal sales and earnings
- Manage own profile

**Firebase Custom Claim**:
```json
{
  "agent": true,
  "role": "SUPER_AGENT",
  "agentId": "agent-uid-here",
  "permissions": ["users:create", "users:read", "users:update", "transactions:create", "transactions:read", "profile:manage"]
}
```

**Access Level**: Tier 2 (Middle)

---

### 3. End User / Player (USER)

**Definition**: Regular player who uses the Crown Bingo application to play games.

**Responsibilities**:
- Play bingo games
- Manage personal wallet
- View personal transaction history
- Update profile information
- Set language preference

**Firebase Custom Claim**:
```json
{
  "role": "USER",
  "permissions": ["games:play", "profile:manage", "transactions:read:own", "balance:view"]
}
```

**Access Level**: Tier 3 (Lowest)

---

## Permission Categories

### User Management Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `users:create` | Create new user accounts | ✅ | ✅ | ❌ |
| `users:read` | View user details | ✅ | ✅ (own) | ✅ (self) |
| `users:read:all` | View all users | ✅ | ❌ | ❌ |
| `users:update` | Update user information | ✅ | ✅ (own) | ✅ (self) |
| `users:delete` | Delete user accounts | ✅ | ❌ | ❌ |
| `users:enable` | Enable disabled accounts | ✅ | ✅ (own) | ❌ |
| `users:disable` | Disable accounts | ✅ | ✅ (own) | ❌ |

### Agent Management Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `agents:create` | Create agent accounts | ✅ | ❌ | ❌ |
| `agents:read` | View agent details | ✅ | ✅ (self) | ❌ |
| `agents:read:all` | View all agents | ✅ | ❌ | ❌ |
| `agents:update` | Update agent information | ✅ | ✅ (self) | ❌ |
| `agents:delete` | Delete agents | ✅ | ❌ | ❌ |
| `agents:set-commission` | Set commission rates | ✅ | ❌ | ❌ |

### Transaction Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `transactions:create` | Create transactions | ✅ | ✅ | ✅ (own) |
| `transactions:read` | View transactions | ✅ | ✅ (user's) | ✅ (own) |
| `transactions:read:all` | View all transactions | ✅ | ❌ | ❌ |
| `balance:view` | View balance | ✅ | ✅ (user's) | ✅ (self) |
| `balance:modify` | Modify balance | ✅ | ✅ | ❌ |

### Game Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `games:create` | Create/start games | ❌ | ❌ | ✅ |
| `games:play` | Play games | ❌ | ❌ | ✅ |
| `games:complete` | Complete games | ❌ | ❌ | ✅ |
| `games:read` | View game records | ✅ | ✅ (users') | ✅ (own) |
| `games:read:all` | View all games | ✅ | ❌ | ❌ |
| `games:create-result` | Generate game results | ✅ | ❌ | ✅ |

### Settings Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `settings:read` | View settings | ✅ | ❌ | ❌ |
| `settings:update` | Update settings | ✅ | ❌ | ❌ |
| `settings:maintenance` | Set maintenance mode | ✅ | ❌ | ❌ |

### Analytics Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `analytics:view:dashboard` | View main dashboard | ✅ | ✅ (personal) | ❌ |
| `analytics:view:users` | View user analytics | ✅ | ✅ (own users) | ❌ |
| `analytics:view:revenue` | View revenue data | ✅ | ❌ | ❌ |
| `analytics:view:agents` | View agent data | ✅ | ❌ | ❌ |
| `analytics:export` | Export analytics | ✅ | ❌ | ❌ |

### System Permissions

| Permission | Description | Super Admin | Super Agent | User |
|-----------|-------------|------------|------------|------|
| `admin:set-claims` | Set admin claims | ✅ | ❌ | ❌ |
| `audit:view` | View audit logs | ✅ | ❌ | ❌ |
| `system:config` | Configure system | ✅ | ❌ | ❌ |

---

## Detailed RBAC Matrix

### Super Admin Complete Access

```javascript
const SUPER_ADMIN_PERMISSIONS = {
  // User Management
  users: ['create', 'read', 'read:all', 'update', 'delete', 'enable', 'disable'],
  
  // Agent Management
  agents: ['create', 'read', 'read:all', 'update', 'delete', 'set-commission'],
  
  // Transactions
  transactions: ['create', 'read', 'read:all'],
  balance: ['view', 'modify'],
  
  // Games
  games: ['read', 'read:all', 'create-result'],
  
  // Settings
  settings: ['read', 'update', 'maintenance'],
  
  // Analytics
  analytics: ['view:dashboard', 'view:users', 'view:revenue', 'view:agents', 'export'],
  
  // System
  admin: ['set-claims', 'view:audit', 'config'],
  
  // API
  api: ['*']
};
```

### Super Agent Limited Access

```javascript
const SUPER_AGENT_PERMISSIONS = {
  // User Management (own users only)
  users: ['create', 'read', 'update', 'enable', 'disable'],
  
  // Agent Management (self only)
  agents: ['read:self', 'update:self'],
  
  // Transactions (own users only)
  transactions: ['create', 'read:own'],
  balance: ['view:own'],
  
  // Games (own users only)
  games: ['read:own'],
  
  // Analytics (personal dashboard)
  analytics: ['view:dashboard:personal'],
  
  // API (limited endpoints)
  api: [
    'POST /api/users',
    'GET /api/users/:id',
    'GET /api/users',
    'PUT /api/users/:id',
    'GET /api/transactions',
    'POST /api/transactions/recharge',
    'GET /api/balance/:id',
    'GET /api/analytics/personal'
  ]
};
```

### End User Minimal Access

```javascript
const USER_PERMISSIONS = {
  // User Management (self only)
  users: ['read:self', 'update:self'],
  
  // Transactions (own only)
  transactions: ['read:own'],
  balance: ['view:own'],
  
  // Games (full game access)
  games: ['create', 'play', 'complete', 'read:own', 'create-result'],
  
  // Profile
  profile: ['manage'],
  
  // API (game endpoints)
  api: [
    'GET /api/users/:id',
    'PUT /api/users/:id',
    'GET /api/transactions',
    'GET /api/balance/:id',
    'POST /api/games',
    'GET /api/games/:id',
    'POST /api/games/:id/complete',
    'GET /api/games/history'
  ]
};
```

---

## Feature Access Matrix

### Application Access by Role

| Application | Super Admin | Super Agent | End User |
|-------------|------------|------------|----------|
| **Admin Panel** | ✅ Full | ❌ | ❌ |
| **Back Office** | ✅ Full | ✅ Full | ❌ |
| **User App** | ❌ (if enabled) | ❌ (if enabled) | ✅ Full |

### Feature Access Matrix

| Feature | Super Admin | Super Agent | End User |
|---------|------------|------------|----------|
| **Dashboard** | ✅ System-wide | ✅ Personal | ✅ Personal |
| **User Management** | ✅ All | ✅ Created users | ✅ Self |
| **Agent Management** | ✅ All | ❌ | ❌ |
| **Wallet Management** | ✅ All | ✅ Created users | ✅ Self |
| **Recharge Wallet** | ✅ Any user | ✅ Created users | ❌ |
| **View Transactions** | ✅ All | ✅ Created users | ✅ Self |
| **Play Games** | ❌ | ❌ | ✅ |
| **Create Games** | ❌ | ❌ | ✅ |
| **Settings** | ✅ | ❌ | ❌ |
| **Analytics** | ✅ System | ✅ Personal | ❌ |
| **Audit Logs** | ✅ | ❌ | ❌ |

---

## Data Access Rules

### User Data Access

```javascript
// Super Admin: Access all user data
canAccessUserData(admin, targetUserId) {
  return admin.role === 'SUPER_ADMIN';
}

// Super Agent: Access only users they created
canAccessUserData(agent, targetUserId) {
  return agent.role === 'SUPER_AGENT' && 
    agent.createdUsers.includes(targetUserId);
}

// User: Access only own data
canAccessUserData(user, targetUserId) {
  return user.role === 'USER' && 
    user.uid === targetUserId;
}
```

### Transaction Data Access

```javascript
// Super Admin: Access all transactions
canAccessTransaction(admin, transaction) {
  return admin.role === 'SUPER_ADMIN';
}

// Super Agent: Access transactions for users they created
canAccessTransaction(agent, transaction) {
  return agent.role === 'SUPER_AGENT' && 
    agent.createdUsers.includes(transaction.userId);
}

// User: Access only own transactions
canAccessTransaction(user, transaction) {
  return user.role === 'USER' && 
    user.uid === transaction.userId;
}
```

### Balance Access

```javascript
// Super Admin: Can view and modify any balance
canModifyBalance(admin, targetUserId) {
  return admin.role === 'SUPER_ADMIN';
}

// Super Agent: Can view and recharge users they created
canModifyBalance(agent, targetUserId) {
  return agent.role === 'SUPER_AGENT' && 
    agent.createdUsers.includes(targetUserId);
}

// User: Can only view own balance
canModifyBalance(user, targetUserId) {
  return false; // Users cannot modify their own balance
}

canViewBalance(user, targetUserId) {
  return user.uid === targetUserId;
}
```

---

## API Endpoint Access

### User Management Endpoints

| Endpoint | Method | Super Admin | Super Agent | User |
|----------|--------|------------|------------|------|
| `/api/users` | POST | ✅ | ✅ | ❌ |
| `/api/users` | GET | ✅ All | ✅ Own | ❌ |
| `/api/users/:id` | GET | ✅ | ✅ Own | ✅ Self |
| `/api/users/:id` | PUT | ✅ | ✅ Own | ✅ Self |
| `/api/users/:id` | DELETE | ✅ | ❌ | ❌ |
| `/api/users/:id/disable` | PATCH | ✅ | ✅ Own | ❌ |
| `/api/users/:id/enable` | PATCH | ✅ | ✅ Own | ❌ |

### Agent Management Endpoints

| Endpoint | Method | Super Admin | Super Agent | User |
|----------|--------|------------|------------|------|
| `/api/agents` | POST | ✅ | ❌ | ❌ |
| `/api/agents` | GET | ✅ | ❌ | ❌ |
| `/api/agents/:id` | GET | ✅ | ✅ Self | ❌ |
| `/api/agents/:id` | PUT | ✅ | ✅ Self | ❌ |
| `/api/agents/:id` | DELETE | ✅ | ❌ | ❌ |

### Transaction Endpoints

| Endpoint | Method | Super Admin | Super Agent | User |
|----------|--------|------------|------------|------|
| `/api/transactions` | GET | ✅ All | ✅ Own Users | ✅ Own |
| `/api/transactions/recharge` | POST | ✅ | ✅ Own Users | ❌ |
| `/api/transactions/:id` | GET | ✅ | ✅ Own Users | ✅ Own |

### Game Endpoints

| Endpoint | Method | Super Admin | Super Agent | User |
|----------|--------|------------|------------|------|
| `/api/games` | POST | ❌ | ❌ | ✅ |
| `/api/games/:id` | GET | ✅ | ✅ Own Users | ✅ Own |
| `/api/games/:id/complete` | POST | ❌ | ❌ | ✅ |
| `/api/games/history` | GET | ✅ All | ✅ Own Users | ✅ Own |

### Analytics Endpoints

| Endpoint | Method | Super Admin | Super Agent | User |
|----------|--------|------------|------------|------|
| `/api/dashboard/stats` | GET | ✅ | ❌ | ❌ |
| `/api/analytics/agents` | GET | ✅ | ❌ | ❌ |
| `/api/analytics/personal` | GET | ❌ | ✅ | ❌ |
| `/api/analytics/export` | GET | ✅ | ❌ | ❌ |

---

## Firestore Rules

### Complete Security Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check role
    function getUserRole() {
      return request.auth.token.role;
    }
    
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    function isAgent() {
      return request.auth.token.agent == true;
    }
    
    function isUser() {
      return !isAdmin() && !isAgent();
    }
    
    function isCreatedByUser(doc) {
      return doc.data().createdBy == request.auth.uid;
    }
    
    function isTargetUser(userId) {
      return userId == request.auth.uid;
    }
    
    // ==================== USERS COLLECTION ====================
    match /users/{userId} {
      // Read access
      allow read: if request.auth != null && (
        isAdmin() ||
        (isAgent() && resource.data.createdBy == request.auth.uid) ||
        isTargetUser(userId)
      );
      
      // Create access
      allow create: if request.auth != null && (
        isAdmin() || isAgent()
      ) && 
      request.resource.data.get('createdBy') == request.auth.uid;
      
      // Update access
      allow update: if request.auth != null && (
        isAdmin() ||
        (isAgent() && resource.data.createdBy == request.auth.uid) ||
        isTargetUser(userId)
      );
      
      // Delete access
      allow delete: if request.auth != null && isAdmin();
    }
    
    // ==================== AGENTS COLLECTION ====================
    match /agents/{agentId} {
      // Read access
      allow read: if request.auth != null && (
        isAdmin() ||
        (isAgent() && request.auth.uid == agentId)
      );
      
      // Create access
      allow create: if request.auth != null && 
        isAdmin() &&
        request.resource.data.get('createdBy') == request.auth.uid;
      
      // Update access
      allow update: if request.auth != null && (
        isAdmin() ||
        (isAgent() && request.auth.uid == agentId)
      );
      
      // Delete access
      allow delete: if request.auth != null && isAdmin();
    }
    
    // ==================== TRANSACTIONS COLLECTION ====================
    match /transactions/{transactionId} {
      // Read access
      allow read: if request.auth != null && (
        isAdmin() ||
        (isAgent() && resource.data.get('userId') in 
          get(/databases/$(database)/documents/agents/$(request.auth.uid)).data.get('managedUsers', [])) ||
        isTargetUser(resource.data.get('userId'))
      );
      
      // Create access
      allow create: if request.auth != null && (
        isAdmin() || 
        isAgent()
      );
      
      // Delete access
      allow delete: if request.auth != null && isAdmin();
    }
    
    // ==================== GAMES COLLECTION ====================
    match /games/{gameId} {
      // Read access
      allow read: if request.auth != null && (
        isAdmin() ||
        (isAgent() && resource.data.get('userId') in 
          get(/databases/$(database)/documents/agents/$(request.auth.uid)).data.get('managedUsers', [])) ||
        isTargetUser(resource.data.get('userId'))
      );
      
      // Create access (only users)
      allow create: if request.auth != null && 
        isUser() &&
        request.resource.data.get('userId') == request.auth.uid;
      
      // Update access (only own)
      allow update: if request.auth != null && 
        resource.data.get('userId') == request.auth.uid;
    }
    
    // ==================== SETTINGS COLLECTION ====================
    match /settings/{settingId} {
      // Read access (only admin)
      allow read: if request.auth != null && isAdmin();
      
      // Write access (only admin)
      allow write: if request.auth != null && isAdmin();
    }
    
    // ==================== AUDIT LOGS COLLECTION ====================
    match /auditLogs/{logId} {
      // Read access (only admin)
      allow read: if request.auth != null && isAdmin();
      
      // Create access (system)
      allow create: if request.auth != null;
    }
  }
}
```

---

## Role Hierarchy

```
┌─────────────────────────────────────┐
│       SUPER ADMIN                   │
│  (Tier 1 - Highest Authority)       │
│                                     │
│  • Full system access               │
│  • Manages everything               │
│  • Can delegate to agents           │
│  • Can demote/remove agents         │
└────────────┬────────────────────────┘
             │ Creates/Manages
             ▼
┌─────────────────────────────────────┐
│     SUPER AGENT                     │
│  (Tier 2 - Agent Level)             │
│                                     │
│  • Creates users                    │
│  • Manages created users            │
│  • Manages wallet/transactions      │
│  • Can't manage other agents        │
│  • Can't access settings            │
└────────────┬────────────────────────┘
             │ Creates/Manages
             ▼
┌─────────────────────────────────────┐
│        END USER / PLAYER            │
│  (Tier 3 - Lowest Authority)        │
│                                     │
│  • Plays games                      │
│  • Manages own account              │
│  • View own transactions            │
│  • No system access                 │
└─────────────────────────────────────┘
```

---

## Permission Management

### Setting Permissions (Firebase Console)

```javascript
// Set Super Admin claims
const admin = require('firebase-admin');

async function setAdminClaim(uid) {
  await admin.auth().setCustomUserClaims(uid, {
    admin: true,
    role: 'SUPER_ADMIN',
    permissions: ['*']
  });
}

// Set Super Agent claims
async function setAgentClaim(uid, agentId) {
  await admin.auth().setCustomUserClaims(uid, {
    agent: true,
    role: 'SUPER_AGENT',
    agentId: agentId,
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:enable',
      'users:disable',
      'transactions:create',
      'transactions:read',
      'balance:view'
    ]
  });
}

// Set User claims (default - no special claims)
async function setUserClaim(uid) {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'USER',
    permissions: ['games:play', 'profile:manage']
  });
}
```

### Permission Validation Middleware

```javascript
// Middleware for checking permissions
function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userPermissions = req.user.custom_claims?.permissions || [];
    
    // Admin has all permissions
    if (userPermissions.includes('*')) {
      return next();
    }
    
    // Check specific permission
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Usage in routes
app.post('/api/users', 
  authenticate,
  checkPermission('users:create'),
  createUser
);

app.delete('/api/users/:id',
  authenticate,
  checkPermission('users:delete'),
  deleteUser
);
```

---

## Implementation Code

### Role-Based Route Protection (React)

```javascript
// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function PrivateRoute({ element, requiredRole }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
}

// App.js
<Routes>
  <Route
    path="/admin"
    element={
      <PrivateRoute 
        element={<AdminPanel />} 
        requiredRole="SUPER_ADMIN"
      />
    }
  />
  <Route
    path="/backoffice"
    element={
      <PrivateRoute 
        element={<BackOffice />} 
        requiredRole="SUPER_AGENT"
      />
    }
  />
  <Route
    path="/play"
    element={
      <PrivateRoute 
        element={<UserApp />} 
        requiredRole="USER"
      />
    }
  />
</Routes>
```

### Permission Checking Utility

```javascript
// permissionUtils.js
export function hasPermission(user, permission) {
  if (!user || !user.custom_claims) {
    return false;
  }
  
  const permissions = user.custom_claims.permissions || [];
  
  // Admin has all permissions
  if (permissions.includes('*')) {
    return true;
  }
  
  return permissions.includes(permission);
}

export function hasRole(user, role) {
  return user?.custom_claims?.role === role;
}

export function canAccessUser(currentUser, targetUserId) {
  // Admin can access anyone
  if (hasRole(currentUser, 'SUPER_ADMIN')) {
    return true;
  }
  
  // User can access own data
  if (currentUser.uid === targetUserId) {
    return true;
  }
  
  // Agent can access created users (would need to check createdUsers array)
  if (hasRole(currentUser, 'SUPER_AGENT')) {
    return currentUser.createdUsers?.includes(targetUserId) || false;
  }
  
  return false;
}

export function canDeleteUser(currentUser) {
  return hasPermission(currentUser, 'users:delete');
}

export function canCreateUser(currentUser) {
  return hasPermission(currentUser, 'users:create');
}

export function canRechargeWallet(currentUser) {
  return hasPermission(currentUser, 'transactions:create');
}
```

### API Endpoint Protection

```javascript
// Middleware to check permissions on API
async function apiPermissionCheck(req, res, next) {
  const user = req.user;
  const method = req.method;
  const path = req.path;
  
  // Define endpoint permissions
  const endpointPermissions = {
    'POST /api/users': 'users:create',
    'GET /api/users': 'users:read',
    'PUT /api/users/:id': 'users:update',
    'DELETE /api/users/:id': 'users:delete',
    'POST /api/transactions': 'transactions:create',
    'POST /api/games': 'games:create',
  };
  
  const requiredPermission = endpointPermissions[`${method} ${path}`];
  
  if (requiredPermission) {
    if (!hasPermission(user, requiredPermission)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Permission required: ${requiredPermission}`
      });
    }
  }
  
  next();
}

app.use(authenticate);
app.use(apiPermissionCheck);
```

---

## Audit Trail for Permission Changes

```javascript
// Log all permission changes
async function logPermissionChange(admin, targetUser, newClaims) {
  await db.collection('auditLogs').add({
    timestamp: new Date(),
    action: 'PERMISSION_CHANGE',
    performedBy: admin.uid,
    targetUser: targetUser.uid,
    oldClaims: targetUser.custom_claims,
    newClaims: newClaims,
    reason: 'User role update',
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
}

// View audit logs
app.get('/api/audit-logs', authenticate, checkPermission('audit:view'), async (req, res) => {
  const logs = await db.collection('auditLogs')
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();
  
  res.json(logs.docs.map(doc => doc.data()));
});
```

---

## Permission Testing Checklist

- [ ] Super Admin can create agents
- [ ] Super Admin can modify any user
- [ ] Super Admin can view all transactions
- [ ] Super Agent can create users
- [ ] Super Agent cannot create agents
- [ ] Super Agent can only manage own users
- [ ] User cannot create accounts
- [ ] User can only view own data
- [ ] Permissions enforced in Firestore rules
- [ ] Permissions enforced in API endpoints
- [ ] Permissions enforced in React routes
- [ ] Audit logs track all changes

---

**RBAC Matrix Version**: 1.0  
**Last Updated**: May 30, 2026  
**Status**: Production Ready
