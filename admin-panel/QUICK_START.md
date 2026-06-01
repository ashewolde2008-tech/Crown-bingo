# Crown Bingo Admin Panel - Quick Reference

## 🚀 Launching the Admin Panel

### Method 1: Python Server (Recommended)
```bash
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
python -m http.server 3000
```
Then open: **http://localhost:3000/admin.html**

### Method 2: Double-click start.bat
Just double-click the `start.bat` file in the admin-panel folder.

## 🔐 Default Admin Login

- **Email**: admin@crownbingo.com
- **Password**: AdminPassword123!

⚠️ **First time?** You must create this admin user in Firebase first! See SETUP_GUIDE.md

## 📍 Admin Panel URL

```
http://localhost:3000/admin.html
```

Or access your website while server is running:
- Main Website: http://localhost:8000
- Admin Panel: http://localhost:3000/admin.html

## 🎯 Main Features

| Feature | Location | What You Can Do |
|---------|----------|-----------------|
| **Dashboard** | Home | View statistics and analytics |
| **Users** | Left Menu | Create, edit, delete users |
| **Agents** | Left Menu | Manage agents and commission rates |
| **Settings** | Left Menu | Configure app parameters |
| **Logout** | Bottom of Menu | Exit admin panel |

## 👥 User Management Tasks

| Task | Steps |
|------|-------|
| **Add User** | Users → + Add New User → Fill form → Save |
| **Edit User** | Users → Find user → Edit → Save |
| **Delete User** | Users → Find user → Delete → Confirm |
| **Search** | Users → Type in search box → Auto-filters |

## 🤖 Agent Management Tasks

| Task | Steps |
|------|-------|
| **Add Agent** | Agents → + Add New Agent → Fill form → Save |
| **Edit Agent** | Agents → Find agent → Edit → Save |
| **Set Commission** | Add/Edit Agent → Enter Commission % → Save |
| **Delete Agent** | Agents → Find agent → Delete → Confirm |
| **Search** | Agents → Type in search box → Auto-filters |

## ⚙️ System Settings

| Setting | Purpose | Recommended Value |
|---------|---------|-------------------|
| Min Bet | Minimum allowed bet | $10 |
| Max Bet | Maximum allowed bet | $1000 |
| Commission % | Agent earnings percentage | 5% |
| Maintenance Mode | Disable app for maintenance | Off (unless needed) |

## 📊 Dashboard Stats

- **Total Users**: All registered users
- **Active Users**: Currently active accounts
- **Total Agents**: Registered agents/partners
- **Total Bets**: All bets placed in system

## 🔗 Connected Systems

The admin panel is connected to:

1. **Frontend Application**: `http://localhost:8000`
   - Located in: `c:\Users\ASHE\Documents\Crown Bingo\superagentcrownbingo`
   - Server: Port 8000

2. **Admin Panel**: `http://localhost:3000`
   - Located in: `c:\Users\ASHE\Documents\Crown Bingo\admin-panel`
   - Server: Port 3000

3. **Firebase Firestore**: Cloud database
   - Project: bingo-27d37
   - Shared data between frontend and admin panel

## ⚡ Quick Commands

```bash
# Start admin panel server
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
python -m http.server 3000

# Start website server (if not running)
cd "c:\Users\ASHE\Documents\Crown Bingo\superagentcrownbingo"
python -m http.server 8000

# Stop server
# Press Ctrl+C in the terminal
```

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Firebase is not defined" | Refresh page, check internet |
| Login not working | Verify admin user exists in Firebase |
| Data not showing | Check Firestore has data, refresh page |
| Page shows directory listing | Go to http://localhost:3000/admin.html |
| Port already in use | Change port: `python -m http.server 3001` |

## 📱 Device Support

- ✅ Desktop computers
- ✅ Tablets (iPad, Android)
- ✅ Mobile phones
- ✅ All modern browsers

## 📞 Help Resources

- **Setup Guide**: See SETUP_GUIDE.md
- **README**: See README.md
- **Firebase Issues**: Check Firebase Console
- **Browser Errors**: Press F12 → Console tab

---

**Pro Tip**: Bookmark these URLs for quick access:
- Admin Panel: `http://localhost:3000/admin.html`
- Website: `http://localhost:8000`
