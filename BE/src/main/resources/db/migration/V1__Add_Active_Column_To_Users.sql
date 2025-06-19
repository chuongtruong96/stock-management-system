-- Migration script to add active column to users table
-- and remove fullName and phoneNumber columns

-- Add active column with default value true
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Update existing users to be active by default
UPDATE users SET active = true WHERE active IS NULL;

-- Remove fullName column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS full_name;
ALTER TABLE users DROP COLUMN IF EXISTS fullname;

-- Remove phoneNumber column if it exists  
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
ALTER TABLE users DROP COLUMN IF EXISTS phonenumber;

-- Add comment for documentation
COMMENT ON COLUMN users.active IS 'Indicates if the user account is active and can login';