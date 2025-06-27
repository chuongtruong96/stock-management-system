
-- Product Name Migration Script
-- This script migrates product names from the old 'name' column to new 'name_vn' and 'name_en' columns

-- Step 1: Check current schema state
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name IN ('name', 'name_vn', 'name_en', 'image')
ORDER BY column_name;

-- Step 2: Add new columns if they don't exist
DO $$
BEGIN
    -- Add name_vn column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'name_vn'
    ) THEN
        ALTER TABLE products ADD COLUMN name_vn VARCHAR(255);
        RAISE NOTICE 'Added name_vn column';
    END IF;
    
    -- Add name_en column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'name_en'
    ) THEN
        ALTER TABLE products ADD COLUMN name_en VARCHAR(255);
        RAISE NOTICE 'Added name_en column';
    END IF;
    
    -- Add image column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image'
    ) THEN
        ALTER TABLE products ADD COLUMN image VARCHAR(255);
        RAISE NOTICE 'Added image column';
    END IF;
END $$;

-- Step 3: Migrate data from 'name' to 'name_vn' if needed
UPDATE products 
SET name_vn = name 
WHERE name_vn IS NULL 
    AND name IS NOT NULL;

-- Step 4: Set English names as fallback (copy Vietnamese names for now)
-- In a real scenario, you would use a translation service
UPDATE products 
SET name_en = name_vn 
WHERE name_en IS NULL 
    AND name_vn IS NOT NULL;

-- Step 5: Show migration results
SELECT 
    product_id,
    code,
    name as old_name,
    name_vn,
    name_en,
    image,
    CASE 
        WHEN name_vn IS NOT NULL AND name_en IS NOT NULL THEN 'Migrated'
        WHEN name_vn IS NULL AND name IS NOT NULL THEN 'Needs Migration'
        ELSE 'No Data'
    END as migration_status
FROM products 
ORDER BY product_id
LIMIT 10;

-- Step 6: Show summary statistics
SELECT 
    COUNT(*) as total_products,
    COUNT(name) as products_with_old_name,
    COUNT(name_vn) as products_with_name_vn,
    COUNT(name_en) as products_with_name_en,
    COUNT(image) as products_with_image
FROM products;

-- Step 7: Optional - Drop the old 'name' column after verification
-- UNCOMMENT THE FOLLOWING LINES ONLY AFTER VERIFYING THE MIGRATION IS SUCCESSFUL
-- ALTER TABLE products DROP COLUMN IF EXISTS name;
-- COMMENT ON TABLE products IS 'Product names migrated to name_vn and name_en columns';