@echo off
echo Exporting local database to SQL file...
pg_dump -h localhost -p 5432 -U postgres -d stationery-mgnt-be -f stationery-mgnt-be-backup.sql
echo Export completed! File saved as: stationery-mgnt-be-backup.sql
pause