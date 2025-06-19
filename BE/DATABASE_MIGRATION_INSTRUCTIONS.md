# Database Migration Instructions

## Issue
The application is failing with the error:
```
org.postgresql.util.PSQLException: ERROR: column u1_0.active does not exist
```

This happens because we updated the User entity to remove `fullName` and `phoneNumber` fields and added an `active` field, but the database schema hasn't been updated.

## Solution Options

### Option 1: Automatic Migration (Recommended)
The application now includes an automatic migration component that will run when you start the Spring Boot application. Simply restart your application and the migration will happen automatically.

### Option 2: Manual Database Update
If the automatic migration doesn't work, you can run the SQL script manually:

1. **Connect to your PostgreSQL database:**
   ```bash
   psql -U postgres -d stationery-mgnt-be
   ```

2. **Run the migration script:**
   ```bash
   \i database_migration.sql
   ```

   Or copy and paste the SQL commands from `database_migration.sql` into your PostgreSQL client.

### Option 3: Individual SQL Commands
If you prefer to run commands individually:

```sql
-- 1. Add active column
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- 2. Update existing users to be active
UPDATE users SET active = true WHERE active IS NULL;

-- 3. Remove deprecated columns (check which ones exist first)
ALTER TABLE users DROP COLUMN IF EXISTS full_name;
ALTER TABLE users DROP COLUMN IF EXISTS fullname;
ALTER TABLE users DROP COLUMN IF EXISTS "fullName";
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
ALTER TABLE users DROP COLUMN IF EXISTS phonenumber;
ALTER TABLE users DROP COLUMN IF EXISTS "phoneNumber";

-- 4. Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

## Expected Schema After Migration

The `users` table should have these columns:
- `user_id` (INTEGER, PRIMARY KEY)
- `username` (VARCHAR, UNIQUE, NOT NULL)
- `password` (VARCHAR, NOT NULL)
- `email` (VARCHAR, NULLABLE)
- `active` (BOOLEAN, NOT NULL, DEFAULT true)
- `department_id` (INTEGER, FOREIGN KEY, NOT NULL)
- `role` (VARCHAR, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Verification

After running the migration:

1. **Check the schema:**
   ```sql
   \d users
   ```

2. **Verify data:**
   ```sql
   SELECT user_id, username, email, active, department_id, role 
   FROM users 
   LIMIT 5;
   ```

3. **Start the Spring Boot application:**
   ```bash
   cd BE
   mvn spring-boot:run
   ```

## Troubleshooting

### If you get permission errors:
Make sure you're connected as a user with ALTER TABLE permissions (usually the database owner or postgres user).

### If columns don't exist:
Some column names might be different in your database. Check the actual column names:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
```

### If the application still fails:
1. Check the application logs for specific error messages
2. Verify that all columns mentioned in the error exist in your database
3. Make sure the database connection settings in `application.properties` are correct

## Changes Made

### User Entity Changes:
- ✅ Removed `fullName` field
- ✅ Removed `phoneNumber` field  
- ✅ Added `active` field (boolean, default true)

### Business Logic Changes:
- Each user represents a department (no personal info needed)
- Department users have USER role only
- Only 1 admin user exists
- Active field controls user login ability

## Next Steps

After the database migration is complete:
1. Restart the Spring Boot application
2. Test the login functionality
3. Verify that the frontend can load user information correctly
4. Check that order creation works properly

The application should now start without database errors!