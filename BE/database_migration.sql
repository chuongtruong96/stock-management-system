-- Database Migration Script for Stationery Management System
-- Run this script on your PostgreSQL database to fix the schema issues

-- Connect to your database first:
-- psql -U postgres -d stationery-mgnt-be

-- 1. Add active column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'active') THEN
        ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added active column to users table';
    ELSE
        RAISE NOTICE 'Active column already exists in users table';
    END IF;
END $$;

-- 2. Update all existing users to be active by default
UPDATE users SET active = true WHERE active IS NULL;

-- 3. Remove fullName column if it exists (check different naming conventions)
DO $$
BEGIN
    -- Check for full_name (snake_case)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users DROP COLUMN full_name;
        RAISE NOTICE 'Dropped full_name column from users table';
    END IF;
    
    -- Check for fullname (lowercase)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'fullname') THEN
        ALTER TABLE users DROP COLUMN fullname;
        RAISE NOTICE 'Dropped fullname column from users table';
    END IF;
    
    -- Check for fullName (camelCase)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'fullName') THEN
        ALTER TABLE users DROP COLUMN "fullName";
        RAISE NOTICE 'Dropped fullName column from users table';
    END IF;
END $$;

-- 4. Remove phoneNumber column if it exists (check different naming conventions)
DO $$
BEGIN
    -- Check for phone_number (snake_case)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users DROP COLUMN phone_number;
        RAISE NOTICE 'Dropped phone_number column from users table';
    END IF;
    
    -- Check for phonenumber (lowercase)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'phonenumber') THEN
        ALTER TABLE users DROP COLUMN phonenumber;
        RAISE NOTICE 'Dropped phonenumber column from users table';
    END IF;
    
    -- Check for phoneNumber (camelCase)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'phoneNumber') THEN
        ALTER TABLE users DROP COLUMN "phoneNumber";
        RAISE NOTICE 'Dropped phoneNumber column from users table';
    END IF;
END $$;

-- 5. Add comment for documentation
COMMENT ON COLUMN users.active IS 'Indicates if the user account is active and can login';

-- 6. Verify the final schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 7. Show current users data to verify
SELECT user_id, username, email, active, department_id, role 
FROM users 
LIMIT 5;

RAISE NOTICE 'Database migration completed successfully!';
RAISE NOTICE 'Please restart your Spring Boot application to apply the changes.';