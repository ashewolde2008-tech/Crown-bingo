# Firebase Deployment Instructions for Crown Bingo Admin

## Issue Fixed
✅ Updated `admin-panel/src/firebase.js` to use the correct Firebase project: `bingo-27d37-5661f`

## Remaining Steps (Manual Deployment Required)

Since Firebase CLI requires interactive authentication, please follow these manual steps via Firebase Console:

### Step 1: Deploy Firestore Rules

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **bingo-27d37-5661f**
3. Navigate to: **Firestore Database** > **Rules**
4. Copy the entire contents of `firestore.rules` from the project root
5. Paste it into the Rules editor in Firebase Console
6. Click **Publish**

### Step 2: Deploy Firestore Indexes

1. In the same Firebase Console project (bingo-27d37-5661f)
2. Navigate to: **Firestore Database** > **Indexes**
3. Click **Add Index** for each index in `firestore.indexes.json`:
   - Collection Group: e.g., "users"
   - Fields: Add each field with the specified order (ASCENDING/DESCENDING)
4. Click **Create** for each index
5. Wait for indexes to build (may take a few minutes)

**OR** use the batch file if you have Firebase CLI authenticated:
```bash
deploy-firestore-admin.bat
```

### Step 3: Verify User Has SUPER_ADMIN Custom Claim

1. In Firebase Console, navigate to: **Authentication** > **Users**
2. Find your admin user email
3. Click on the user to see details
4. Check if **Custom Claims** includes `role: "SUPER_ADMIN"`

If not set, run the script:
```bash
cd admin-panel
node setAdminClaim.js
```

Note: This requires `serviceAccountKey.json` in the admin-panel directory (download from Firebase Console > Project Settings > Service Accounts)

### Step 4: Rebuild and Test Admin Panel

After completing steps 1-3:

```bash
cd admin-panel
npm run build
```

Then test the admin panel at: https://crown-bingo-admin.pages.dev/admin

All pages should now work without permission errors:
- ✅ Users page
- ✅ Agents & Settings page
- ✅ Audit Log page

## Summary of Changes Made

1. **admin-panel/src/firebase.js**: Updated project ID from `bingo-27d37` to `bingo-27d37-5661f`
2. **deploy-firestore-admin.bat**: Created helper script for CLI deployment (optional)
