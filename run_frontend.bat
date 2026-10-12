@echo off
title FleetOps - Frontend Web App (Port 5173)
echo ========================================================
echo Checking if port 5173 is currently occupied...
echo ========================================================

:: Automatically free port 5173 if another instance is running
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Freeing port 5173 from process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting FleetOps React Frontend on port 5173...
echo ========================================================
cd /d "%~dp0frontend"
call npm.cmd run dev
pause
