@echo off
echo Installing Crown Bingo Admin Panel...
echo.
cd /d "%~dp0"
echo Current directory: %cd%
echo.
echo Installing dependencies with npm...
call npm install
echo.
if errorlevel 1 (
    echo Error installing dependencies!
    pause
    exit /b 1
)
echo.
echo Dependencies installed successfully!
echo.
echo To start the admin panel, run:
echo npm start
echo.
pause
