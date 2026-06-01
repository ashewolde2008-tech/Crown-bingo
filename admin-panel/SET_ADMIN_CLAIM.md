# 🔐 How to Set Admin Custom Claim - Step by Step Guide

## Problem
Firebase Console doesn't have a UI option to set custom claims. You need to use the **Firebase Admin SDK** or **Firebase CLI**.

---

## ✅ Solution: Use the Node.js Script (Easiest)

I've created a script that will set the admin claim for you automatically!

### **Step 1: Download Firebase Service Account Key**

1. Go to: https://console.firebase.google.com/project/bingo-27d37-5661f/settings/serviceaccounts/adminsdk
2. Make sure you're on the **"Service Accounts"** tab
3. Look for your language: **Node.js**
4. Click **"Generate new private key"**
5. A JSON file will download - rename it to: **serviceAccountKey.json**
6. Move/copy it to: `c:\Users\ASHE\Documents\Crown Bingo\admin-panel\serviceAccountKey.json`

### **Step 2: Install Firebase Admin SDK**

Open a terminal in the admin-panel directory:

```bash
cd "c:\Users\ASHE\Documents\Crown Bingo\admin-panel"
npm install firebase-admin
```

### **Step 3: Run the Script**

```bash
node setAdminClaim.js
```

You should see:
```
✅ Firebase Admin SDK initialized
📧 Setting admin claim for: admin@crownbingo.com
✅ Found user: [uid]
✅ Custom claim set successfully!
✨ User admin@crownbingo.com is now an admin!
```

### **Step 4: Test the Login**

1. Go to: http://localhost:3000/admin.html
2. Login with:
   - Email: `admin@crownbingo.com`
   - Password: `AdminPassword123!`
3. You should now see the admin dashboard! 🎉

---

## 📋 Alternative: Use Firebase CLI (Without Script)

If you prefer to use the CLI directly:

### **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

### **Login to Firebase**
```bash
firebase login
```

### **Set Admin Claim**
```bash
firebase functions:config:set admin.email="admin@crownbingo.com"
```

Or use this command (requires Firebase emulator):
```bash
firebase auth:import users.json --project bingo-27d37-5661f
```

---

## 🆘 Troubleshooting

### Error: "serviceAccountKey.json not found"
- Download the file as shown in **Step 1**
- Make sure it's in the `admin-panel` directory
- Filename must be exactly: `serviceAccountKey.json`

### Error: "User not found"
- First create the user in Firebase Console:
  1. Go to: https://console.firebase.google.com/project/bingo-27d37-5661f/authentication/users
  2. Click **Create user**
  3. Email: `admin@crownbingo.com`
  4. Password: `AdminPassword123!`
  5. Then run the script again

### Error: "Permission denied"
- Make sure your service account key has the right permissions
- Try downloading a new key from Firebase Console

### Login still fails after setting claim
- Wait 5-10 seconds for Firebase to sync
- Clear browser cache and reload: http://localhost:3000/admin.html
- Check browser console for error messages

---

## ✨ What Happens When You Run the Script

The script:
1. ✅ Reads your service account key
2. ✅ Connects to Firebase Admin SDK
3. ✅ Finds the user by email
4. ✅ Sets custom claim: `{"admin": true}`
5. ✅ Verifies the claim was set
6. ✅ Shows success message

After this, you can login to the admin panel!

---

## 🔑 Understanding Custom Claims

Custom claims are metadata attached to a user that determines their role/permissions:

```javascript
{
  "admin": true  // This user is an admin
}
```

The admin panel checks for this claim:
```javascript
if (token.claims.admin === true) {
  // Show admin panel
} else {
  // Deny access
}
```

---

## 📝 Quick Checklist

- [ ] Download serviceAccountKey.json from Firebase Console
- [ ] Place it in: `admin-panel/serviceAccountKey.json`
- [ ] Run: `npm install firebase-admin`
- [ ] Run: `node setAdminClaim.js`
- [ ] See success message
- [ ] Login to admin panel at http://localhost:3000/admin.html
- [ ] ✅ Done!

---

## 💡 Next Steps

Once you've successfully set the admin claim:

1. **Login to Admin Panel**: http://localhost:3000/admin.html
2. **View Dashboard**: See users, agents, and statistics
3. **Manage Users**: Add, edit, delete users
4. **Manage Agents**: Add, edit, delete agents
5. **Configure Settings**: Set system preferences

---

**Need Help?** Check the console for detailed error messages!
