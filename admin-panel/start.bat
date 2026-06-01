@echo off
echo Starting Crown Bingo Admin Panel...
echo.
cd /d "%~dp0"
echo Current directory: %cd%
echo.
echo Starting development server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start
if errorlevel 1 (
    echo Error starting the server!
    pause
    exit /b 1
)
