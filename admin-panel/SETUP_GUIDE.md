# Crown Bingo Admin Panel - Setup & Usage Guide

## 📋 Overview

The Crown Bingo Admin Panel is a modern, standalone back office system that provides complete administrative control over your Crown Bingo application. It allows you to manage users, agents, system settings, and view real-time analytics from a centralized dashboard.

## ✨ Features

✅ **Modern Admin Dashboard** - Beautiful, responsive interface  
✅ **User Management** - Create, edit, delete, and manage users  
✅ **Agent Management** - Manage betting agents and commission rates  
✅ **System Settings** - Configure app parameters and business rules  
✅ **Real-time Analytics** - View key statistics and metrics  
✅ **Secure Authentication** - Firebase authentication with admin verification  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **No Build Required** - Standalone HTML file, runs immediately  

## 🚀 Quick Start

### Prerequisites

- **Internet Connection** (for Firebase)
- **Python 3** (or Node.js) for local server
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Launch the Admin Panel

#### Option 1: Using Python (Recommended - Windows)

```bash
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
python -m http.server 3000
```

Then open: **http://localhost:3000/admin.html**

#### Option 2: Using Node.js

```bash
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
npx http-server -p 3000
```

#### Option 3: Quick Start Script

Simply double-click `start.bat` in the admin-panel folder.

## 🔐 Admin Login Setup

### Creating an Admin User

To access the admin panel, you need an admin account in Firebase:

#### Step 1: Create Admin User in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **bingo-27d37** project
3. Navigate to **Authentication** → **Users**
4. Click **Create user**
5. Enter admin email and password:
   - Email: `admin@crownbingo.com`
   - Password: `AdminPassword123!`
6. Click **Create user**

#### Step 2: Set Admin Custom Claim

1. In Firebase Console, go to **Authentication** → **Users**
2. Click on the admin user you just created
3. Scroll to **Custom Claims** section
4. Click **Edit custom claims**
5. Add the following JSON:
```json
{
  "admin": true
}
```
6. Click **Save**

Now you can log in with:
- **Email**: `admin@crownbingo.com`
- **Password**: `AdminPassword123!`

## 📖 Using the Admin Panel

### Dashboard

The dashboard displays key statistics:
- **Total Users** - Number of registered users
- **Active Users** - Number of currently active users
- **Total Agents** - Number of agents/partners
- **Total Bets** - Total number of bets placed

### User Management

#### Adding a New User

1. Click **Users** in the left menu
2. Click **+ Add New User** button
3. Fill in the form:
   - **Username** - Display name for the user
   - **Email** - User's email address
   - **Phone** - User's phone number (optional)
   - **Balance** - Initial account balance
4. Click **Save User**

#### Editing a User

1. Go to **Users** section
2. Find the user in the table
3. Click the **Edit** button
4. Modify the information
5. Click **Save User**

#### Deleting a User

1. Go to **Users** section
2. Find the user in the table
3. Click the **Delete** button
4. Confirm the deletion

#### Searching Users

1. Go to **Users** section
2. Type in the search box to filter by username or email
3. Results update in real-time

### Agent Management

#### Adding a New Agent

1. Click **Agents** in the left menu
2. Click **+ Add New Agent** button
3. Fill in the form:
   - **Agent Name** - Full name of the agent
   - **Agent Code** - Unique identifier (e.g., AGT001)
   - **Email** - Agent's email address
   - **Phone** - Agent's phone number (optional)
   - **Commission Rate** - % commission on sales (e.g., 5%)
4. Click **Save Agent**

#### Editing an Agent

1. Go to **Agents** section
2. Find the agent in the table
3. Click the **Edit** button
4. Modify the information
5. Click **Save Agent**

#### Managing Commission Rates

Commission rates determine how much agents earn from sales:
- **Example**: If commission is 5% and agent sales = $1000, agent earns $50
- You can adjust this rate per agent to incentivize performance

#### Deleting an Agent

1. Go to **Agents** section
2. Find the agent in the table
3. Click the **Delete** button
4. Confirm the deletion

### System Settings

Configure critical application parameters:

#### Application Settings

- **App Name** - Display name for your application
- **App Version** - Current version number
- **Maintenance Mode** - Toggle to temporarily disable the app for maintenance

#### Business Settings

- **Min Bet Amount** - Minimum allowed bet ($10 recommended)
- **Max Bet Amount** - Maximum allowed bet ($1000 recommended)
- **Commission Rate** - Default commission % (5% recommended)

#### Contact Information

- **Support Email** - Email for user support inquiries
- **Support Phone** - Phone number for support
- **Support Website** - URL for your support page

**To save settings:** Click the green **Save All Settings** button at the bottom.

## 🔒 Security Notes

⚠️ **Important Security Practices:**

1. **Admin Credentials**
   - Never share admin login credentials
   - Use a strong password (min 8 characters, mix of upper/lower case, numbers)
   - Change admin password regularly

2. **Firebase Security Rules**
   - Restrict admin collection access to admin users only
   - Only allow authenticated users to read their own data
   - Implement proper authorization checks

3. **Session Management**
   - Admin sessions are tied to Firebase authentication
   - Sessions remain active while logged in
   - Click **Logout** when done to end the session

4. **Data Protection**
   - All sensitive data (passwords) are handled by Firebase
   - Passwords are never transmitted unencrypted
   - Use HTTPS in production

## 📊 Database Collections

The admin panel works with these Firestore collections:

### Users Collection
```
{
  id: "user_id",
  username: "john_doe",
  email: "john@example.com",
  phone: "+1-234-567-8900",
  balance: 500.00,
  isActive: true,
  createdAt: timestamp
}
```

### Agents Collection
```
{
  id: "agent_id",
  agentName: "Agent Smith",
  agentCode: "AGT001",
  email: "agent@example.com",
  phone: "+1-234-567-8900",
  commissionRate: 5,
  isActive: true,
  totalSales: 10000,
  createdAt: timestamp
}
```

### Settings Collection
```
{
  appName: "Crown Bingo",
  appVersion: "1.0.0",
  minBet: 10,
  maxBet: 1000,
  commissionRate: 5,
  maintenanceMode: false,
  supportEmail: "support@crownbingo.com",
  supportPhone: "+1-234-567-8900"
}
```

## 🛠️ Troubleshooting

### Firebase Not Loading

**Problem**: "Firebase is not defined" error  
**Solution**: 
- Check internet connection
- Firebase SDK loads from CDN - make sure you're not blocked
- Refresh the page and try again

### Login Not Working

**Problem**: Login button does nothing  
**Solution**:
- Verify admin user exists in Firebase Console
- Check that admin custom claim is set to `{"admin": true}`
- Verify credentials are correct
- Check browser console for error messages (F12)

### Data Not Appearing

**Problem**: Users/Agents not showing in tables  
**Solution**:
- Verify data exists in Firestore (check Firebase Console)
- Check Firestore security rules allow reads
- Refresh the page
- Check browser console for errors

### Page Not Loading

**Problem**: Page shows directory listing  
**Solution**:
- Navigate directly to `http://localhost:3000/admin.html`
- Make sure the server is running
- Check that admin.html file exists

## 📱 Responsive Design

The admin panel is fully responsive:

- **Desktop** (1200px+): Full sidebar navigation
- **Tablet** (768px-1199px): Collapsible sidebar
- **Mobile** (<768px): Mobile-optimized menu toggle

## 🔄 Integration with Frontend

The admin panel uses the same Firebase project as your frontend application:

- **Project**: `bingo-27d37`
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage

Any changes made in the admin panel are immediately reflected in the frontend application because they share the same Firestore database.

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console errors (F12)
- Verify Firebase configuration
- Check Firestore security rules
- Contact development team

## 📝 Version Information

- **Admin Panel Version**: 1.0.0
- **Firebase SDK**: 9.22.0
- **Last Updated**: May 29, 2026
- **Built with**: HTML5, CSS3, JavaScript (Vanilla)

## 🎯 Future Enhancements

Planned features for next releases:
- 📊 Advanced analytics and reporting
- 📧 Bulk email notifications
- 🔔 Push notification system
- 💳 Payment processing management
- 📋 Transaction history and audits
- 🏆 User achievements system
- 🎮 Game configuration panel

---

**Crown Bingo Admin Panel** - Manage your application with ease!
