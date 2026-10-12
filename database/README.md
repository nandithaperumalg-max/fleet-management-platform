# FleetOps Database Management

This directory contains the database scripts and backups for the FleetOps Enterprise Fleet Management Platform.

## Database Information
- **Database Engine**: MySQL 8.0+
- **Database Name**: `fleet_management_db`
- **Default User**: `root`
- **Default Password**: `root@123`
- **Port**: `3306`

## Files & Directories

- `schema.sql`: Contains the complete schema (tables, constraints, etc.) without data. Generated automatically by `export_database.bat`.
- `backups/`: Directory where full database backups (schema + data) are stored.
- `export_database.bat`: Windows batch script to export both the `schema.sql` and a full backup with a timestamp into the `backups/` folder.
- `import_database.bat`: Windows batch script to import the latest backup from the `backups/` folder into the database.

## Usage Instructions

### To Backup the Database:
1. Double-click `export_database.bat` OR run it from a command prompt.
2. Ensure the MySQL server is running.
3. The script will automatically generate `schema.sql` and a timestamped full backup in the `backups` folder.

### To Restore/Import the Database:
1. Double-click `import_database.bat`.
2. The script will automatically locate the most recent backup in the `backups` folder.
3. Confirm the restoration prompt. **Note: This will overwrite current data.**

### Troubleshooting
If the batch scripts fail, ensure that your MySQL binaries (`mysql.exe`, `mysqldump.exe`) are either in your system `PATH` or located at the default `C:\Program Files\MySQL\MySQL Server 8.0\bin\`. If they are located elsewhere, please edit the `set MYSQL_DUMP_PATH` or `set MYSQL_PATH` variables in the `.bat` files.
