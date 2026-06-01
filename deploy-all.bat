@echo off
title Crown Bingo - Deploy All to Netlify
echo =========================================
echo  Crown Bingo - Netlify Deployment Script
echo =========================================
echo.
echo This script deploys all 3 apps to Netlify.
echo Prerequisites:
echo   1. Netlify CLI installed (npm install -g netlify-cli)
echo   2. Logged in to Netlify (netlify login)
echo   3. All 3 sites already created on Netlify
echo   4. Internet connection available
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul
echo.

:: Step 1: Build admin-panel
echo [1/4] Building admin-panel React app...
cd /d "%~dp0admin-panel"
if not exist "node_modules\.bin\react-scripts.cmd" (
    echo WARNING: react-scripts not found. Run 'npm install' first.
    echo Skipping admin-panel build...
) else (
    call npm run build
    if errorlevel 1 (
        echo ERROR: Build failed!
        pause
        exit /b 1
    )
    echo Admin-panel build complete.
)

:: Step 2: Deploy crownbingo
echo [2/4] Deploying crownbingo to Netlify...
cd /d "%~dp0crownbingo"
netlify deploy --prod --dir=.
if errorlevel 1 (
    echo ERROR: crownbingo deploy failed!
)
echo.

:: Step 3: Deploy superagentcrownbingo
echo [3/4] Deploying superagentcrownbingo to Netlify...
cd /d "%~dp0superagentcrownbingo"
netlify deploy --prod --dir=.
if errorlevel 1 (
    echo ERROR: superagentcrownbingo deploy failed!
)
echo.

:: Step 4: Deploy admin-panel
echo [4/4] Deploying admin-panel to Netlify...
cd /d "%~dp0admin-panel"
if exist "build\index.html" (
    netlify deploy --prod --dir=build
) else (
    echo No build folder found. Deploying current directory as fallback.
    netlify deploy --prod --dir=.
)
echo.

echo =========================================
echo  Deployment complete!
echo =========================================
echo.
pause
