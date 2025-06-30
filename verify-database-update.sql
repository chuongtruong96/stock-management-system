-- Verify that the database update worked
-- Run these queries to check if your images are now using Cloudinary URLs

-- Check products table
SELECT 
    product_id, 
    name, 
    image,
    CASE 
        WHEN image LIKE 'https://res.cloudinary.com/%' THEN '✅ Cloudinary'
        WHEN image LIKE '/uploads/%' THEN '❌ Local'
        ELSE '❓ Other'
    END as image_status
FROM products 
WHERE image IS NOT NULL
ORDER BY product_id
LIMIT 10;

-- Check categories table  
SELECT 
    category_id,
    name_en,
    icon,
    CASE 
        WHEN icon LIKE 'https://res.cloudinary.com/%' THEN '✅ Cloudinary'
        WHEN icon LIKE '/uploads/%' THEN '❌ Local'
        ELSE '❓ Other'
    END as icon_status
FROM categories 
WHERE icon IS NOT NULL
ORDER BY category_id;

-- Count summary
SELECT 
    'Products' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN image LIKE 'https://res.cloudinary.com/%' THEN 1 END) as cloudinary_images,
    COUNT(CASE WHEN image LIKE '/uploads/%' THEN 1 END) as local_images
FROM products
WHERE image IS NOT NULL

UNION ALL

SELECT 
    'Categories' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN icon LIKE 'https://res.cloudinary.com/%' THEN 1 END) as cloudinary_images,
    COUNT(CASE WHEN icon LIKE '/uploads/%' THEN 1 END) as local_images
FROM categories
WHERE icon IS NOT NULL;