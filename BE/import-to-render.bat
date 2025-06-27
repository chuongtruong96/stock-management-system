@echo off
echo Importing database to Render PostgreSQL...
echo.
echo You need to replace the connection details below with your actual Render database info:
echo.
echo psql -h [RENDER_HOSTNAME] -p [RENDER_PORT] -U [RENDER_USERNAME] -d [RENDER_DATABASE] -f stationery-mgnt-be-backup.sql
echo.
echo Example:
echo psql -h dpg-abc123-a.oregon-postgres.render.com -p 5432 -U myuser -d stationery_db -f stationery-mgnt-be-backup.sql
echo.
pause