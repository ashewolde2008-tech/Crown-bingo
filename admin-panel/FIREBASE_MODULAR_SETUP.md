# Firebase Modular Setup - Crown Bingo Admin Panel

## 🎯 What's Been Updated

### ✅ **Option 1: Standalone HTML (admin.html)** 
- **File**: `admin.html`
- **Firebase Config**: Updated with new credentials (bingo-27d37-5661f)
- **Method**: CDN-based (older Firebase SDK)
- **Status**: Ready to use immediately!
- **Access**: `http://localhost:3000/admin.html`

### ✅ **Option 2: React + Modular (Recommended for Development)**
- **Files Updated**:
  - `src/firebase.js` - New modular Firebase setup with all helper functions
  - `src/App.js` - React component (already compatible)
- **Firebase Config**: Updated with new credentials (bingo-27d37-5661f)
- **Method**: Modular Firebase SDK (new approach)
- **Status**: Ready to use with npm start

---

## 🚀 Running the Applications

### **Quick Start - Admin HTML (No Build Needed)**
```bash
# Server already running on port 3000
# Just open in browser:
http://localhost:3000/admin.html
```

### **React App (With Build Tools)**
```bash
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

---

## 📋 New Firebase Configuration

Both versions now use the updated Firebase project:

```javascript
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

**Project**: `bingo-27d37-5661f` (New)  
**Replaces**: `bingo-27d37` (Old)

---

## 📚 Using the Modular Firebase Functions

### **In src/firebase.js** - Available Exports:

```javascript
// Authentication
import { loginUser, logoutUser, isUserAdmin, setupAuthListener } from './firebase.js';

// Users
import { getAllUsers, addUser, updateUser, deleteUser } from './firebase.js';

// Agents  
import { getAllAgents, addAgent, updateAgent, deleteAgent } from './firebase.js';

// Settings
import { getSettings, updateSettings } from './firebase.js';

// Direct Firestore
import { auth, db, collection, getDocs, doc, etc. } from './firebase.js';
```

### **Usage Examples:**

#### Login a user:
```javascript
try {
  const user = await loginUser('admin@example.com', 'password123');
  console.log('Logged in:', user.email);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### Get all users:
```javascript
try {
  const users = await getAllUsers();
  console.log('Users:', users);
  // Returns: [{ id, username, email, phone, balance, isActive, ... }, ...]
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Add a new user:
```javascript
try {
  await addUser({
    username: 'john_doe',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    balance: 100,
    isActive: true
  });
  // User created successfully!
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Update user:
```javascript
try {
  await updateUser('userId123', {
    balance: 150,
    isActive: true
  });
  console.log('User updated!');
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Delete user:
```javascript
try {
  await deleteUser('userId123');
  console.log('User deleted!');
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Get all agents:
```javascript
try {
  const agents = await getAllAgents();
  console.log('Agents:', agents);
  // Returns: [{ id, agentName, agentCode, email, commissionRate, ... }, ...]
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Create agent:
```javascript
try {
  await addAgent({
    agentName: 'Agent Smith',
    agentCode: 'AGENT001',
    email: 'agent@example.com',
    commissionRate: 5
  });
  console.log('Agent created!');
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Get settings:
```javascript
try {
  const settings = await getSettings();
  console.log('Settings:', settings);
  // Returns: { appName, appVersion, minBet, maxBet, commissionRate, ... }
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Save settings:
```javascript
try {
  await updateSettings({
    appName: 'Crown Bingo',
    minBet: 10,
    maxBet: 1000,
    commissionRate: 5
  });
  console.log('Settings saved!');
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Setup auth state listener:
```javascript
import { setupAuthListener } from './firebase.js';

setupAuthListener((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});
```

#### Check if user is admin:
```javascript
import { isUserAdmin } from './firebase.js';

try {
  const isAdmin = await isUserAdmin(user);
  if (isAdmin) {
    console.log('User is admin!');
  } else {
    console.log('User is not admin');
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔄 Using in React Components

```javascript
import React, { useEffect, useState } from 'react';
import { getAllUsers, addUser } from '../firebase.js';

export function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUsers();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.username} - {user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── firebase.js          ← Modular Firebase setup (UPDATED)
│   ├── App.js              ← React component
│   ├── index.js            ← React entry point
│   └── components/
│       ├── pages/
│       │   ├── Dashboard.js
│       │   ├── UserManagement.js
│       │   ├── AgentManagement.js
│       │   ├── Settings.js
│       │   └── AdminLogin.js
│       ├── layouts/
│       └── fragments/
├── admin.html              ← Standalone admin panel (UPDATED)
├── package.json
├── public/
└── node_modules/
```

---

## ✨ Firebase SDK Comparison

| Feature | CDN (admin.html) | Modular (React) |
|---------|------------------|-----------------|
| **Setup** | CDN links | npm install firebase |
| **Build Required** | No | Yes (npm start) |
| **Bundle Size** | ~150KB | ~50KB (when compiled) |
| **Performance** | Good | Better |
| **Scalability** | Medium | High |
| **Development** | Quick | Professional |
| **Production** | Works | Recommended |

---

## 🔧 Troubleshooting

### "Firebase is not initialized"
- Make sure `npm install firebase` is run
- Check firebase.js exports are correct
- Verify Firebase config credentials

### "User is not admin"
- Go to Firebase Console
- Select project: `bingo-27d37-5661f`
- Go to Authentication → Users
- Click on the user
- Set custom claim: `{"admin": true}`

### "Connection refused on port 3000"
- Make sure Python HTTP server is running
- Or use: `npm start` for React development server

### "Module not found"
- Run `npm install` in admin-panel directory
- Make sure all imports use correct paths

---

## 📞 Quick Reference

### Admin Panel URLs
- **Standalone HTML**: `http://localhost:3000/admin.html`
- **React App**: `http://localhost:3000` (when using npm start)

### Firebase Project
- **Name**: bingo-27d37-5661f
- **Console**: https://console.firebase.google.com

### Default Admin Login
- **Email**: admin@crownbingo.com
- **Password**: AdminPassword123!

---

## ✅ Next Steps

1. ✅ **Firebase config updated** with new project credentials
2. ✅ **Modular functions** created in src/firebase.js
3. ✅ **Standalone HTML** (admin.html) working
4. Choose your approach:
   - **Option A**: Use admin.html (standalone, no build)
   - **Option B**: Use React with npm start (modern, scalable)

---

## 📖 Documentation

- **Standalone**: See comments in `admin.html`
- **Modular**: See comments in `src/firebase.js`
- **React**: See React component files in `src/components/`

---

**Status**: ✅ Both approaches ready to use with updated Firebase project!
