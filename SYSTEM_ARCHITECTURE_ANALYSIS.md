# Crown Bingo System Architecture Analysis

## Executive Summary

The Crown Bingo system is a **three-tier hierarchical role-based application** with clear separation of concerns:

1. **User Application (crownbingo)** - Player-facing interface
2. **Back Office (superagentcrownbingo)** - Super Agent management system  
3. **Admin Panel (admin-panel)** - Super Admin management system

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPER ADMIN                             │
│                    (admin-panel)                                 │
│  - Manages Users, Agents, System Settings, Dashboard Analytics  │
│  - Full system control                                           │
│  - Firebase Authentication with Admin Claims                     │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             │ Manages                        │ Manages
             ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────┐
│   BACK OFFICE           │      │   USER APPLICATION         │
│ (superagentcrownbingo) │      │   (crownbingo)             │
│                        │      │                            │
│ Super Agents can:      │      │ Users can:                 │
│ • Create user accounts │      │ • Login to account         │
│ • Recharge wallets     │      │ • Play bingo games         │
│ • Enable/Disable users │      │ • View game history        │
│ • View user details    │      │ • Manage transactions      │
│ • Access user accounts │      │ • Update profile           │
│ • Manage transactions  │      │ • Check balance            │
└────────────────────────┘      └────────────────────────────┘
             │                                │
             └────────────┬───────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Firebase        │
                 │  (Backend)       │
                 │                  │
                 │ • Authentication │
                 │ • Firestore DB   │
                 │ • Storage        │
                 │ • Analytics      │
                 └──────────────────┘
```

---

## 1. SUPER ADMIN PANEL (admin-panel)

### Purpose
Super Admin interface for complete system management and oversight.

### Access Level
- **Role**: Super Admin
- **Authentication**: Firebase Auth with `admin: true` custom claim
- **Port**: 3000
- **URL**: `http://localhost:3000/admin.html`

### Key Features

#### 🏠 Dashboard
- Real-time statistics display
- Total Users count
- Active Users count
- Total Agents count
- Total Bets placed
- Visual stat cards with gradients

#### 👥 User Management
**Manage all end users (Crown Bingo players)**
- **Create Users**
  - Username (display name)
  - Email address
  - Phone number
  - Initial balance
  - Auto-generate temporary password: `TempPassword123!`
  
- **Edit Users**
  - Update user information
  - Modify balance
  - Update contact details
  
- **Delete Users**
  - Remove user accounts
  - Associated data cleanup
  
- **Search & Filter**
  - Find users by username/email
  - View active/inactive users

- **User Status**
  - Track isActive status
  - Monitor account creation date

#### 🤖 Agent Management
**Manage Super Agents (back office operators)**
- **Create Agents**
  - Agent name
  - Unique agent code
  - Email address
  - Phone number
  - Commission rate configuration
  
- **Edit Agents**
  - Update agent information
  - Adjust commission rates
  - Modify contact details
  
- **Track Agent Metrics**
  - Total sales
  - Total earnings
  - Commission calculations
  
- **Status Control**
  - Enable/disable agents
  - Monitor agent activity

#### ⚙️ System Settings
- Configure application parameters
- Business rules setup
- Contact information management
- System configuration

#### 📊 Real-time Analytics
- Live user and agent metrics
- Bet statistics
- Revenue tracking
- Performance monitoring

### Technology Stack
- **Frontend**: React 18.2.0
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Analytics
- **Form Management**: Formik + Yup validation
- **Charting**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios
- **Notifications**: React-Toastify

### Firebase Integration
```javascript
// Firebase Config (New Project)
const firebaseConfig = {
    apiKey: "AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do",
    authDomain: "bingo-27d37-5661f.firebaseapp.com",
    projectId: "bingo-27d37-5661f",
    storageBucket: "bingo-27d37-5661f.firebasestorage.app",
    messagingSenderId: "330815222659",
    appId: "1:330815222659:web:4890bf5cddc728bf29bcb6",
    measurementId: "G-CD4DWDC8SW"
};

// Collections in Firestore:
// - users (end players)
// - agents (super agents)
// - bets (game bets)
// - settings (system configuration)
```

### Component Structure
```
admin-panel/src/
├── components/
│   ├── layouts/
│   │   └── AdminLayout.js          # Main navigation layout
│   ├── pages/
│   │   ├── AdminLogin.js           # Authentication page
│   │   ├── Dashboard.js            # Statistics & metrics
│   │   ├── UserManagement.js       # User CRUD operations
│   │   ├── AgentManagement.js      # Agent CRUD operations
│   │   └── Settings.js             # System configuration
│   └── fragments/
│       └── LoadingScreen.js        # Loading indicator
├── services/
│   └── firebase.js                 # Helper functions
├── App.js                          # Main component
├── firebase.js                     # Firebase config
└── index.js                        # Entry point
```

---

## 2. BACK OFFICE (superagentcrownbingo)

### Purpose
Back office system for Super Agents to manage Crown Bingo user accounts and perform administrative operations.

### Access Level
- **Role**: Super Agent
- **Authentication**: Firebase Authentication
- **Port**: 8000
- **URL**: `http://localhost:8000`

### Key Features

#### 🔐 Agent Login
- Email/password authentication
- Session management
- Account verification

#### 👥 User Account Management
- **Create New User Accounts**
  - Register new players with details
  - Assign initial balance/wallet credit
  
- **View User Accounts**
  - List all users created by the agent
  - Search and filter functionality
  - User details dashboard
  
- **Account Management**
  - Enable/disable accounts
  - View user profile information
  - Monitor user status

#### 💰 Wallet & Transaction Management
- **Recharge User Wallets**
  - Add funds to user accounts
  - Transaction history tracking
  - Balance reconciliation
  
- **View Transactions**
  - User transaction history
  - Payment records
  - Balance adjustments
  
- **Financial Reporting**
  - Agent earnings tracking
  - Commission calculations
  - Sales analytics

#### 📋 User History
- Game history viewing
- Transaction logs
- Account activity tracking
- User behavior analytics

#### ⚙️ Agent Settings
- Profile management
- Commission tracking
- Personal settings
- Contact information

### Technology Stack
- **Frontend**: React (Built & Compiled)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Real-time updates via Firestore listeners
- **UI Components**: Custom React components
- **Notifications**: React-Toastify
- **Routing**: React Router
- **Localization**: Multi-language support (LanguageContext)
- **State Management**: LocalStorage + Firestore Real-time listeners

### Firebase Integration
```javascript
// Firebase Config (Original Project)
const firebaseConfig = {
    apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
    authDomain: "bingo-27d37.firebaseapp.com",
    projectId: "bingo-27d37",
    storageBucket: "bingo-27d37.firebasestorage.app",
    messagingSenderId: "509582453061",
    appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: "G-VTLQ243Q66"
};

// Collections:
// - agents (super agent accounts)
// - users (user accounts managed by agents)
// - transactions (financial records)
// - gameHistory (player game records)
```

### Key Responsibilities
- **User Creation**: Register new players in the system
- **Wallet Management**: Recharge user balances
- **Account Control**: Enable/disable user accounts
- **Financial Oversight**: Track transactions and commissions
- **User Support**: View and manage user accounts
- **Reporting**: Access sales and earnings reports

### Real-time Features
- Firestore listeners for user status changes
- Real-time balance updates
- Account disable notifications
- Transaction notifications

---

## 3. USER APPLICATION (crownbingo)

### Purpose
Player-facing application where end users (players) can play bingo games and manage their accounts.

### Access Level
- **Role**: End User / Player
- **Authentication**: Firebase Authentication
- **Port**: Default (served by server.js on port 3000)
- **URL**: `http://localhost:8000` (if using superagentcrownbingo)

### Key Features

#### 🔐 User Authentication
- Email/password login
- Account registration
- Session management
- Profile management

#### 🎮 Bingo Games
- **Game Creation**
  - Create new bingo games
  - Configure game parameters
  - Set betting amounts
  
- **Number Generator**
  - Generate random bingo numbers
  - Game draw mechanics
  - Real-time number display
  
- **Game History**
  - View past games
  - Check results
  - Historical records
  
- **Play Audio**
  - Sound effects for numbers
  - Audio notifications
  - Game alerts

#### 💰 Wallet & Transactions
- **View Balance**
  - Current wallet balance
  - Available funds
  - Transaction history
  
- **Transaction History**
  - Bet records
  - Winnings
  - Deposits/withdrawals
  - Complete financial history
  
- **Payment Integration**
  - Place bets
  - Win payments
  - Balance updates

#### 📱 User Dashboard
- Personal statistics
- Account overview
- Quick access to games
- Profile information

#### 🌍 Localization
- Multi-language support
- Language selector
- User preference storage
- Dynamic translations

#### 🎨 Responsive Design
- Mobile-friendly interface
- Desktop optimization
- Tablet support
- Adaptive layouts

### Technology Stack
- **Frontend**: React (Built & Compiled)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Analytics
- **Real-time Features**: Firestore listeners
- **UI Components**: Custom React components
- **Routing**: React Router with Hash routing
- **State Management**: LocalStorage + Firestore
- **Notifications**: React-Toastify
- **Localization**: Custom LanguageContext
- **Media Support**: Images, audio files for game

### Firebase Integration
```javascript
// Firebase Config (Original Project)
const firebaseConfig = {
    apiKey: "AIzaSyDM_bwlzoRTNBtGTm8WFWfnol_aTA3Or2o",
    authDomain: "bingo-27d37.firebaseapp.com",
    projectId: "bingo-27d37",
    storageBucket: "bingo-27d37.firebasestorage.app",
    messagingSenderId: "509582453061",
    appId: "1:509582453061:web:7506bd6e5ff45c5e58b62c",
    measurementId: "G-VTLQ243Q66"
};

// Collections:
// - users (player accounts)
// - games (bingo game records)
// - bets (player bets)
// - transactions (financial records)
// - gameHistory (player game history)
```

### Real-time Monitoring
- Account status listeners
- Disable/logout notifications
- Balance update listeners
- Game state synchronization

### Directory Structure
```
crownbingo/static/
├── js/
│   ├── App.js                 # Main app router
│   ├── firebase.js            # Firebase config
│   ├── index.js               # Entry point
│   ├── LanguageContext.js     # Language state
│   ├── components/
│   │   ├── customBingoText.js
│   │   ├── customButton.js
│   │   ├── Dialog.js
│   │   ├── drawer.js
│   │   ├── table.js
│   │   ├── Transaction.js
│   │   └── UsersTable.js
│   ├── constant/
│   │   └── constant.js
│   └── pages/
│       ├── home.js            # Landing page
│       ├── login.js           # Authentication
│       ├── Dashboard.js       # Main dashboard
│       ├── CreateNewGame.js   # Game creation
│       ├── gameHistory.js     # Game records
│       ├── Admin.js           # Admin interface
│       ├── banner.js          # Banner component
│       ├── LanguageSelector.js
│       ├── PrivateRoute.js    # Route protection
│       └── ...
├── css/
│   └── ...styling files...
└── media/
    └── ...images/audio files...
```

---

## Data Flow & Relationships

### User Registration & Account Creation

**Flow**: Super Agent (superagentcrownbingo) creates user account
```
Super Agent → Admin (superagentcrownbingo) 
    ↓ Creates New User
Firebase Users Collection
    ↓ User is created with
    - Email
    - Temporary Password
    - Initial Balance
    ↓
Player can now login to crownbingo
```

### Wallet Recharge Flow

**Flow**: Super Agent recharges user wallet
```
Super Agent → User Details Page
    ↓ Enter Amount
    ↓ Confirm Transaction
Firebase Transactions Collection
    ↓ Record transaction
Firebase Users Collection
    ↓ Update user balance
    ↓
User sees updated balance in crownbingo
```

### Account Disable Flow

**Flow**: Super Agent or Super Admin disables user account
```
Super Agent/Admin
    ↓ Disable User
Firebase Users Collection
    ↓ Set isDisabled = true
    ↓
crownbingo App detects change (Firestore listener)
    ↓ Real-time notification
    ↓ Force logout
    ↓ Redirect to login
```

---

## Role-Based Access Control (RBAC)

| Action | Super Admin | Super Agent | End User |
|--------|------------|-------------|----------|
| **View Super Admin Panel** | ✅ | ❌ | ❌ |
| **Manage Super Admins** | ✅ | ❌ | ❌ |
| **View/Manage All Agents** | ✅ | ❌ | ❌ |
| **View/Manage All Users** | ✅ | ✅ | ❌ |
| **Create User Accounts** | ✅ | ✅ | ❌ |
| **Recharge User Wallets** | ✅ | ✅ | ❌ |
| **Enable/Disable Users** | ✅ | ✅ | ❌ |
| **Set Commission Rates** | ✅ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ✅ (personal) |
| **Play Games** | ❌ | ❌ | ✅ |
| **Manage Own Account** | ✅ | ✅ | ✅ |
| **View Transactions** | ✅ | ✅ | ✅ (own) |

---

## Firebase Database Structure

### Collections Overview

#### 1. **users** Collection
```javascript
{
  uid: "firebase-uid",
  username: "player_name",
  email: "user@example.com",
  phone: "1234567890",
  balance: 1000,
  isActive: true,
  isDisabled: false,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "agent_uid" // Super Agent who created this user
}
```

#### 2. **agents** Collection
```javascript
{
  uid: "firebase-uid",
  agentName: "Agent Name",
  agentCode: "AGENT001",
  email: "agent@example.com",
  phone: "1234567890",
  commissionRate: 5, // percentage
  isActive: true,
  totalSales: 50000,
  totalEarnings: 2500,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin_uid" // Super Admin who created this agent
}
```

#### 3. **bets** Collection
```javascript
{
  uid: "bet-id",
  userId: "user-uid",
  gameId: "game-id",
  amount: 100,
  numbers: [1, 2, 3, ...],
  result: "WIN" | "LOSS",
  winnings: 200,
  timestamp: Timestamp,
  status: "COMPLETED" | "PENDING"
}
```

#### 4. **transactions** Collection
```javascript
{
  uid: "transaction-id",
  userId: "user-uid",
  type: "RECHARGE" | "BET" | "WIN" | "WITHDRAWAL",
  amount: 500,
  balance_before: 1000,
  balance_after: 1500,
  description: "Wallet recharge by agent",
  agentId: "agent-uid", // If applicable
  timestamp: Timestamp,
  status: "COMPLETED"
}
```

#### 5. **gameHistory** Collection
```javascript
{
  uid: "game-id",
  userId: "user-uid",
  gameDate: Timestamp,
  numbers: [1, 2, 3, ...],
  result: "WIN" | "LOSS",
  winAmount: 200,
  betAmount: 100,
  duration: 300, // seconds
  status: "COMPLETED"
}
```

#### 6. **settings** Collection
```javascript
{
  uid: "settings-id",
  maintenanceMode: false,
  contactEmail: "support@crownbingo.com",
  contactPhone: "1234567890",
  maxBet: 5000,
  minBet: 10,
  maxUsers: 10000,
  updatedAt: Timestamp,
  updatedBy: "admin_uid"
}
```

---

## Security & Authentication

### Firebase Authentication Methods
1. **Email/Password Authentication**
   - Used by all three tiers
   - Temporary password generation for new users
   - Password reset capability

2. **Custom Claims**
   - `admin: true` → Super Admin access
   - Verified at login time
   - Enforced at component level (PrivateRoute)

3. **Session Management**
   - LocalStorage for session data
   - Firebase Auth tokens
   - Real-time listener for account status

### Firestore Security Rules
```
- Anonymous users: No access
- Authenticated users: Access only own data + assigned users (if agent)
- Admins: Full access to all data
- Agents: Access to created users and their transactions
```

---

## Deployment Architecture

### Current Setup
```
Port 3000: Admin Panel (admin-panel source code)
Port 8000: Back Office (superagentcrownbingo built files)
          + User App (crownbingo built files)
```

### File Structure
- **admin-panel**: Source React application with package.json
- **crownbingo**: Pre-built React app (static files only)
- **superagentcrownbingo**: Pre-built React app (static files only)

### Startup
```bash
# Admin Panel (Node.js/npm)
cd admin-panel
npm start

# Back Office & User App (Python HTTP Server)
cd superagentcrownbingo
python -m http.server 8000

cd crownbingo
python -m http.server 3000
# or via server.js
node server.js
```

---

## Key Differentiators

### Crown Bingo (User App)
- ✅ **Feature**: Game playing capability
- ✅ **Feature**: Personal wallet management
- ✅ **Feature**: Game history
- ✅ **Scope**: Individual player operations
- ✅ **Database**: Original Firebase project (bingo-27d37)

### SuperAgent BackOffice
- ✅ **Feature**: User account creation/management
- ✅ **Feature**: Wallet recharge for users
- ✅ **Feature**: User account enable/disable
- ✅ **Feature**: Commission tracking
- ✅ **Scope**: Multiple user management
- ✅ **Database**: Original Firebase project (bingo-27d37)

### Admin Panel
- ✅ **Feature**: Complete system oversight
- ✅ **Feature**: Agent management (create agents, set rates)
- ✅ **Feature**: User management (create users, manage accounts)
- ✅ **Feature**: System settings configuration
- ✅ **Feature**: Analytics and dashboards
- ✅ **Scope**: Cross-application management
- ✅ **Database**: New Firebase project (bingo-27d37-5661f)
- ✅ **Tech**: Modern Material-UI React application with npm

---

## Important Notes

1. **Firebase Projects**
   - Admin Panel uses different Firebase project than the other two
   - Consider database synchronization strategy
   - API layer may be needed for cross-project operations

2. **Authentication Hierarchy**
   - Super Admin → Super Agent → End User (one-way downward chain)
   - Super Admin can manage Super Agents AND all users
   - Super Agents can manage users but NOT other agents
   - End Users can only manage their own account

3. **Financial Integrity**
   - All balance changes via transactions collection
   - Immutable transaction history
   - Audit trail for compliance

4. **Real-time Features**
   - Firestore listeners for account status
   - Immediate effect of account disable
   - Live balance updates

5. **Localization**
   - Multi-language support in user and back office apps
   - Language context-based state management
   - LocalStorage persistence of language preference

---

## System Strengths

✅ Clear role-based hierarchy  
✅ Real-time data synchronization  
✅ Comprehensive user management  
✅ Financial transaction tracking  
✅ Modern responsive UI (Admin Panel)  
✅ Multi-language support  
✅ Secure Firebase authentication  
✅ Modular architecture  
✅ Easy deployment (no build needed for built apps)  

---

## Potential Enhancement Areas

1. **API Layer**: Create REST/GraphQL API to unify Firebase projects
2. **Audit Logging**: Comprehensive logging of all admin actions
3. **Two-Factor Authentication**: Enhanced security for admin panel
4. **Backup & Recovery**: Automated backup procedures
5. **Rate Limiting**: API rate limiting for security
6. **Email Notifications**: Automated emails for account events
7. **SMS Integration**: SMS for critical notifications
8. **Mobile Apps**: Native iOS/Android applications
9. **Advanced Analytics**: Detailed reporting and business intelligence
10. **Multi-currency Support**: Support for multiple currencies

---

## Quick Start Commands

```bash
# Admin Panel
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
npm install
npm start
# Opens: http://localhost:3000

# Back Office (superagentcrownbingo)
cd "c:\Users\ASHE\Documents\Crown Bingo\superagentcrownbingo"
python -m http.server 8000
# Opens: http://localhost:8000

# Or run START_ALL.bat for both
cd "c:\Users\ASHE\Documents\Crown Bingo"
START_ALL.bat
```

---

**Document Generated**: May 30, 2026  
**System Version**: Current  
**Firebase Projects**: 2 (bingo-27d37, bingo-27d37-5661f)  
**Tech Stack**: React + Firebase  
