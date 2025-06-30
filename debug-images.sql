-- Debug: Check if database has Cloudinary URLs
SELECT 
    product_id, 
    name, 
    image,
    CASE 
        WHEN image LIKE 'https://res.cloudinary.com/%' THEN '✅ Cloudinary URL'
        WHEN image LIKE '/uploads/%' THEN '❌ Local path'
        WHEN image IS NULL THEN '❓ No image'
        ELSE '❓ Other: ' || image
    END as image_status
FROM products 
WHERE image IS NOT NULL
ORDER BY product_id
LIMIT 10;

-- Check categories too
SELECT 
    category_id,
    name_en,
    icon,
    CASE 
        WHEN icon LIKE 'https://res.cloudinary.com/%' THEN '✅ Cloudinary URL'
        WHEN icon LIKE '/uploads/%' THEN '❌ Local path'
        WHEN icon IS NULL THEN '❓ No icon'
        ELSE '❓ Other: ' || icon
    END as icon_status
FROM categories 
WHERE icon IS NOT NULL
ORDER BY category_id;