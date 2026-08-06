@echo off
title KARMASTAT - Starting...
cd /d "%~dp0"

echo.
echo  ==========================================
echo    KARMASTAT - Biostatistics Suite
echo  ==========================================
echo.

REM First run only: install dependencies
if not exist "node_modules\" (
    echo  First-time setup: installing dependencies...
    echo  This happens only once. Please wait 1-2 minutes.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERROR: npm install failed. Check that Node.js is installed.
        pause
        exit /b 1
    )
)

echo  Starting KARMASTAT dev server...
echo  Your browser will open automatically.
echo  KEEP THIS WINDOW OPEN while working. Close it to stop the app.
echo.

title KARMASTAT - RUNNING (keep this window open)
call npm run dev -- --open
pause
