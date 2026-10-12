@echo off
echo ===================================================
echo FleetOps Database Import Utility
echo ===================================================
echo.
echo Warning: This will overwrite the existing database content.
set /p CONTINUE="Are you sure you want to continue? (Y/N): "
if /I "%CONTINUE%" NEQ "Y" (
    echo Import cancelled.
    pause
    exit /b
)

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set DB_NAME=fleet_management_db
set DB_USER=root
set DB_PASS=root@123

:: If mysql is in PATH, we can just use 'mysql'
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    set MYSQL_CMD=mysql
) else (
    set MYSQL_CMD=%MYSQL_PATH%
)

:: Find the latest backup file
for /f "delims=" %%a in ('dir /b /o:-d /a:-d "backups\*.sql"') do (
    set LATEST_BACKUP=backups\%%a
    goto found_backup
)

echo [ERROR] No backup files found in the 'backups' directory.
pause
exit /b

:found_backup
echo Found latest backup: %LATEST_BACKUP%
set /p IMPORT_LATEST="Do you want to import this backup? (Y/N): "
if /I "%IMPORT_LATEST%" NEQ "Y" (
    echo Please manually specify the backup file.
    set /p LATEST_BACKUP="Enter backup file path: "
)

echo Importing...
%MYSQL_CMD% -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%LATEST_BACKUP%"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to import database.
    pause
    exit /b %errorlevel%
)

echo [SUCCESS] Database imported successfully!
pause
