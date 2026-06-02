@echo off
REM Crown Bingo - Start All Services
REM This script starts both the frontend and admin panel

echo.
echo =========================================
echo   Crown Bingo - System Startup
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python or add it to your PATH
    pause
    exit /b 1
)

echo Starting Crown Bingo Services...
echo.

REM Start Admin Panel in a new window
echo [1/2] Starting Admin Panel on port 3000...
start "Crown Bingo - Admin Panel" cmd /k cd /d "c:\Users\ASHE\Documents\Crown Bingo\admin-panel" && python -m http.server 3000

REM Wait a moment for first server to start
timeout /t 2 /nobreak

REM Start Frontend in a new window
echo [2/2] Starting Frontend Website on port 8000...
start "Crown Bingo - Website" cmd /k cd /d "c:\Users\ASHE\Documents\Crown Bingo\superagentcrownbingo" && python -m http.server 8000

echo.
echo =========================================
echo   Services Started Successfully!
echo =========================================
echo.
echo Access your applications at:
echo   Admin Panel:  http://localhost:3000/admin.html
echo   Website:      http://localhost:8000
echo.
echo Both windows will remain open while services are running.
echo Close either window to stop that service.
echo.
pause
