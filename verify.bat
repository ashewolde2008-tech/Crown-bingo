@echo off
title Crown Bingo - Project Verification
echo =============================================
echo  Crown Bingo - Project Structure Verification
echo =============================================
echo.
set ERRORS=0

:: Check root files
echo --- Root Files ---
if exist "%~dp0.gitignore" (echo [OK] .gitignore) else (echo [MISSING] .gitignore & set /a ERRORS+=1)
if exist "%~dp0firestore.rules" (echo [OK] firestore.rules) else (echo [MISSING] firestore.rules & set /a ERRORS+=1)
if exist "%~dp0firestore.indexes.json" (echo [OK] firestore.indexes.json) else (echo [MISSING] firestore.indexes.json & set /a ERRORS+=1)
if exist "%~dp0deploy-all.bat" (echo [OK] deploy-all.bat) else (echo [MISSING] deploy-all.bat & set /a ERRORS+=1)
echo.

:: Check crownbingo
echo --- crownbingo ---
if exist "%~dp0crownbingo\.gitignore" (echo [OK] .gitignore) else (echo [MISSING] .gitignore & set /a ERRORS+=1)
if exist "%~dp0crownbingo\netlify.toml" (echo [OK] netlify.toml) else (echo [MISSING] netlify.toml & set /a ERRORS+=1)
if exist "%~dp0crownbingo\_redirects" (echo [OK] _redirects) else (echo [MISSING] _redirects & set /a ERRORS+=1)
if exist "%~dp0crownbingo\index.html" (echo [OK] index.html) else (echo [MISSING] index.html & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\App.js" (echo [OK] App.js) else (echo [MISSING] App.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\firebase.js" (echo [OK] firebase.js) else (echo [MISSING] firebase.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\pages\home.js" (echo [OK] home.js) else (echo [MISSING] home.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\pages\login.js" (echo [OK] login.js) else (echo [MISSING] login.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\components\dropdown.js" (echo [OK] dropdown.js) else (echo [MISSING] dropdown.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\components\texttoSpeech.js" (echo [OK] texttoSpeech.js) else (echo [MISSING] texttoSpeech.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\components\jackpot.js" (echo [OK] jackpot.js) else (echo [MISSING] jackpot.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\pages\anim.js" (echo [OK] anim.js) else (echo [MISSING] anim.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\pages\updatePass.js" (echo [OK] updatePass.js) else (echo [MISSING] updatePass.js & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\locales\en.json" (echo [OK] en.json) else (echo [MISSING] en.json & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\locales\am.json" (echo [OK] am.json) else (echo [MISSING] am.json & set /a ERRORS+=1)
if exist "%~dp0crownbingo\static\js\pages\LoginPage.css" (echo [OK] LoginPage.css) else (echo [MISSING] LoginPage.css & set /a ERRORS+=1)
echo.

:: Check superagentcrownbingo
echo --- superagentcrownbingo ---
if exist "%~dp0superagentcrownbingo\.gitignore" (echo [OK] .gitignore) else (echo [MISSING] .gitignore & set /a ERRORS+=1)
if exist "%~dp0superagentcrownbingo\netlify.toml" (echo [OK] netlify.toml) else (echo [MISSING] netlify.toml & set /a ERRORS+=1)
if exist "%~dp0superagentcrownbingo\_redirects" (echo [OK] _redirects) else (echo [MISSING] _redirects & set /a ERRORS+=1)
if exist "%~dp0superagentcrownbingo\index.html" (echo [OK] index.html) else (echo [MISSING] index.html & set /a ERRORS+=1)
if exist "%~dp0superagentcrownbingo\static\js\App.js" (echo [OK] App.js) else (echo [MISSING] App.js & set /a ERRORS+=1)
echo.

:: Check admin-panel
echo --- admin-panel ---
if exist "%~dp0admin-panel\.gitignore" (echo [OK] .gitignore) else (echo [MISSING] .gitignore & set /a ERRORS+=1)
if exist "%~dp0admin-panel\netlify.toml" (echo [OK] netlify.toml) else (echo [MISSING] netlify.toml & set /a ERRORS+=1)
if exist "%~dp0admin-panel\admin.html" (echo [OK] admin.html) else (echo [MISSING] admin.html & set /a ERRORS+=1)
if exist "%~dp0admin-panel\package.json" (echo [OK] package.json) else (echo [MISSING] package.json & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\App.js" (echo [OK] src/App.js) else (echo [MISSING] src/App.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\firebase.js" (echo [OK] src/firebase.js) else (echo [MISSING] src/firebase.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\index.js" (echo [OK] src/index.js) else (echo [MISSING] src/index.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\public\index.html" (echo [OK] public/index.html) else (echo [MISSING] public/index.html & set /a ERRORS+=1)
if exist "%~dp0admin-panel\public\_redirects" (echo [OK] public/_redirects) else (echo [MISSING] public/_redirects & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\pages\Dashboard.js" (echo [OK] Dashboard.js) else (echo [MISSING] Dashboard.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\pages\UserManagement.js" (echo [OK] UserManagement.js) else (echo [MISSING] UserManagement.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\pages\AgentManagement.js" (echo [OK] AgentManagement.js) else (echo [MISSING] AgentManagement.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\pages\Settings.js" (echo [OK] Settings.js) else (echo [MISSING] Settings.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\pages\AdminLogin.js" (echo [OK] AdminLogin.js) else (echo [MISSING] AdminLogin.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\layouts\AdminLayout.js" (echo [OK] AdminLayout.js) else (echo [MISSING] AdminLayout.js & set /a ERRORS+=1)
if exist "%~dp0admin-panel\src\components\fragments\LoadingScreen.js" (echo [OK] LoadingScreen.js) else (echo [MISSING] LoadingScreen.js & set /a ERRORS+=1)
echo.

:: Summary
echo =============================================
if %ERRORS%==0 goto :summary_ok
echo  %ERRORS% file(s) are missing!
goto :summary_end
:summary_ok
echo  All checks passed! Project is complete.
:summary_end
echo =============================================
echo.
pause
