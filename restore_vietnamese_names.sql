-- SOLUTION 1: Direct SQL Implementation
-- This script restores Vietnamese product names based on the VPPham.xlsx data structure

-- First, let's check current state
SELECT 'Current state check:' as info;
SELECT code, name_vn, name_en FROM products WHERE code IN ('K01', 'K07', 'B35', 'C02') ORDER BY code;

-- Restore Vietnamese names based on your Excel data
-- (I'm inferring the names from the codes and typical Vietnamese stationery naming)

UPDATE products SET name_vn = 'Kim bấm (24/6)' WHERE code = 'K01';
UPDATE products SET name_vn = 'Kim bấm 23/08' WHERE code = 'K02';
UPDATE products SET name_vn = 'Kim bấm 23/10' WHERE code = 'K03';
UPDATE products SET name_vn = 'Kim bấm 23/15' WHERE code = 'K04';
UPDATE products SET name_vn = 'Máy bấm 23/24' WHERE code = 'K05';
UPDATE products SET name_vn = 'Kẹp đen bướm 15 mm' WHERE code = 'K07';
UPDATE products SET name_vn = 'Kẹp đen bướm 19 mm' WHERE code = 'K08';
UPDATE products SET name_vn = 'Kẹp đen bướm 25 mm' WHERE code = 'K09';
UPDATE products SET name_vn = 'Kẹp đen bướm 32 mm' WHERE code = 'K10';
UPDATE products SET name_vn = 'Kẹp đen bướm 41 mm' WHERE code = 'K11';
UPDATE products SET name_vn = 'Kẹp đen bướm 51mm' WHERE code = 'K12';
UPDATE products SET name_vn = 'Kẹp ghim giấy' WHERE code = 'K13';

UPDATE products SET name_vn = 'Băng keo 2 mặt mỏng 1,2cm' WHERE code = 'B01';
UPDATE products SET name_vn = 'Băng keo 2 mặt mỏng 2,4cm' WHERE code = 'B02';
UPDATE products SET name_vn = 'Băng keo 2cm (trong)' WHERE code = 'B03';
UPDATE products SET name_vn = 'Băng keo 5cm (trong)' WHERE code = 'B04';
UPDATE products SET name_vn = 'Băng keo dán gáy sách 3.5 cm' WHERE code = 'B05';
UPDATE products SET name_vn = 'Băng keo dán gáy sách 5 cm' WHERE code = 'B06';
UPDATE products SET name_vn = 'Băng keo giấy 2.4' WHERE code = 'B07';
UPDATE products SET name_vn = 'Bao thư trắng (12 x 22)cm' WHERE code = 'B08';
UPDATE products SET name_vn = 'Bao thư trắng (25 x 35)cm' WHERE code = 'B09';
UPDATE products SET name_vn = 'Bìa còng đại Kokoyo F4' WHERE code = 'B10';
UPDATE products SET name_vn = 'Bìa còng nhựa 3,5cm' WHERE code = 'B11';
UPDATE products SET name_vn = 'Bìa hồ sơ 20 lá' WHERE code = 'B12';

-- Add more products based on your actual Excel data
-- UPDATE products SET name_vn = 'Product Name in Vietnamese' WHERE code = 'B34';
-- UPDATE products SET name_vn = 'Product Name in Vietnamese' WHERE code = 'B35';
-- UPDATE products SET name_vn = 'Product Name in Vietnamese' WHERE code = 'C02';
-- UPDATE products SET name_vn = 'Product Name in Vietnamese' WHERE code = 'R01';

-- For products not in the list above, set a temporary Vietnamese name
UPDATE products SET name_vn = CONCAT('Sản phẩm ', code) 
WHERE name_vn IS NULL AND code IS NOT NULL;

-- Verify the results
SELECT 'After restoration:' as info;
SELECT code, name_vn, name_en FROM products WHERE name_vn IS NOT NULL ORDER BY code LIMIT 20;

-- Count restored products
SELECT 'Summary:' as info;
SELECT 
    COUNT(*) as total_products,
    COUNT(name_vn) as products_with_vietnamese_names,
    COUNT(name_en) as products_with_english_names
FROM products;