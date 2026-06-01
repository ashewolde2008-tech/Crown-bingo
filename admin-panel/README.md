# Crown Bingo Admin Panel

A modern, feature-rich admin panel for managing the Crown Bingo application. This back office provides complete control over users, agents, system settings, and analytics.

## Features

✅ **User Management** - Create, edit, delete, and manage users
✅ **Agent Management** - Manage betting agents and commission rates
✅ **System Settings** - Configure app parameters, maintenance mode, and contact info
✅ **Dashboard Analytics** - Real-time statistics and monitoring
✅ **Authentication** - Secure admin login with Firebase
✅ **Responsive Design** - Modern Material-UI interface
✅ **Real-time Updates** - Live data synchronization with Firestore

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Windows PowerShell or Command Prompt

## Installation

### 1. Navigate to admin panel directory
```bash
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm start
```

The admin panel will open at `http://localhost:3000`

## Default Admin Access

**Important**: Only users with admin claims in Firebase can access this panel.

To set up an admin user:
1. Create a user in Firebase Authentication
2. Use Firebase Admin SDK or console to set custom claim: `admin: true`

Example using Firebase Console:
```
Custom Claims: {"admin": true}
```

## Project Structure

```
admin-panel/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   └── AdminLayout.js      # Main layout component
│   │   ├── pages/
│   │   │   ├── Dashboard.js         # Dashboard with statistics
│   │   │   ├── UserManagement.js    # User CRUD operations
│   │   │   ├── AgentManagement.js   # Agent CRUD operations
│   │   │   ├── Settings.js          # System configuration
│   │   │   └── AdminLogin.js        # Login page
│   │   └── fragments/
│   │       └── LoadingScreen.js     # Loading component
│   ├── services/
│   │   └── firebase.js              # Firebase configuration
│   ├── App.js                       # Main app component
│   ├── index.js                     # Entry point
│   └── firebase.js                  # Firebase setup
├── package.json
├── .gitignore
└── README.md
```

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (not reversible)
npm eject
```

## Page Descriptions

### Dashboard
- View real-time statistics
- Total users, active users, agents, and bets
- Quick overview of system status

### User Management
- Search and filter users
- Create new users (generates temporary password)
- Edit user information
- Delete users
- View user status and balance

### Agent Management
- Manage betting agents
- Set commission rates
- Track agent sales
- Edit agent information
- Monitor agent performance

### Settings
- Configure application name and version
- Set bet amount limits
- Manage commission rates
- Enable/disable maintenance mode
- Update contact information

## Firebase Integration

This admin panel connects to the same Firebase project as the main Crown Bingo app:

- **Authentication**: Firebase Authentication for admin login
- **Database**: Firestore for data storage
- **Storage**: Firebase Storage for media files

Collections used:
- `users` - User information
- `agents` - Agent information
- `bets` - Betting records
- `settings` - Application configuration

## Security Notes

⚠️ **Important Security Considerations:**

1. **Admin Access**: Only set admin claims for trusted users
2. **Firebase Rules**: Ensure Firestore security rules restrict access appropriately
3. **Credentials**: Never share admin login credentials
4. **Sensitive Data**: Passwords are not displayed for security

## Firestore Security Rules Example

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin only
    match /settings/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
    match /users/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
    match /agents/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

## Deployment

To build for production:

```bash
npm run build
```

This creates a `build/` directory with optimized files ready for deployment.

## Troubleshooting

### Login issues
- Verify Firebase credentials in `src/firebase.js`
- Ensure user has admin custom claim set
- Check Firestore security rules

### Data not loading
- Check Firebase connection
- Verify Firestore collections exist
- Check browser console for errors

### Port 3000 already in use
```bash
npm start -- --port 3001
```

## Future Enhancements

- 📊 Advanced analytics and reporting
- 📧 Email notifications system
- 🔔 Push notifications management
- 📱 Mobile app management
- 💳 Payment processing controls
- 📋 Transaction history and audits

## Support

For issues or questions, contact the development team or check the Crown Bingo documentation.

## License

Internal use only - Crown Bingo Admin Panel

---

**Version**: 1.0.0
**Last Updated**: May 29, 2026
