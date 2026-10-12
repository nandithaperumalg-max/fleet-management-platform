@echo off
echo ===================================================
echo FleetOps Database Export Utility
echo ===================================================
echo.
echo Exporting database: fleet_management_db...

set MYSQL_DUMP_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
set DB_NAME=fleet_management_db
set DB_USER=root
set DB_PASS=root@123

:: If mysqldump is in PATH, we can just use 'mysqldump'
:: First try just mysqldump
mysqldump --version >nul 2>&1
if %errorlevel% equ 0 (
    set DUMP_CMD=mysqldump
) else (
    set DUMP_CMD=%MYSQL_DUMP_PATH%
)

:: Export schema only to schema.sql
%DUMP_CMD% -u %DB_USER% -p%DB_PASS% --no-data %DB_NAME% > schema.sql
if %errorlevel% neq 0 (
    echo [ERROR] Failed to export schema. Check credentials and MySQL path.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Schema exported to schema.sql

:: Get current datetime for backup filename
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set mytime=%mytime: =%
set BACKUP_FILE=backups\%DB_NAME%_backup_%mydate%_%mytime%.sql

:: Export full database
%DUMP_CMD% -u %DB_USER% -p%DB_PASS% %DB_NAME% > %BACKUP_FILE%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to export full database backup.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Full database exported to %BACKUP_FILE%

echo.
echo Export completed successfully.
pause
