@echo off
title FleetOps - Backend Server (Port 8080)
echo ========================================================
echo Checking if port 8080 is currently occupied...
echo ========================================================

:: Automatically free port 8080 if another instance is already running
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Freeing port 8080 from process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting FleetOps Spring Boot Backend on port 8080...
echo ========================================================
cd /d "%~dp0backend"
call .\mvnw.cmd spring-boot:run
pause
