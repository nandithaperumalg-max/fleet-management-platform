@echo off
title FleetOps - Database Setup
echo ========================================================
echo Importing fleet_management_db.sql into MySQL...
echo ========================================================
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot@123 -e "CREATE DATABASE IF NOT EXISTS fleet_management_db;"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot@123 fleet_management_db < "%~dp0database\fleet_management_db.sql"
echo Database restored successfully!
pause
