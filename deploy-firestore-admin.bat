@echo off
echo ========================================
echo Deploy Firestore Rules and Indexes
echo to Admin Panel Project (bingo-27d37-5661f)
echo ========================================
echo.

echo Step 1: Checking Firebase authentication...
firebase login --no-localhost
if %errorlevel% neq 0 (
    echo ERROR: Firebase authentication failed. Please run 'firebase login' manually.
    pause
    exit /b 1
)

echo.
echo Step 2: Setting Firebase project to bingo-27d37-5661f...
firebase use bingo-27d37-5661f
if %errorlevel% neq 0 (
    echo ERROR: Failed to set Firebase project. Make sure the project exists.
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying Firestore rules...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy Firestore rules.
    pause
    exit /b 1
)

echo.
echo Step 4: Deploying Firestore indexes...
firebase deploy --only firestore:indexes
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy Firestore indexes.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: Firestore rules and indexes deployed!
echo ========================================
echo.
echo Next steps:
echo 1. Rebuild the admin panel: cd admin-panel && npm run build
echo 2. Test the admin panel at https://crown-bingo-admin.pages.dev/admin
echo.
pause
