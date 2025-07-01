-- Corrected SQL migration to update image URLs to Cloudinary
-- Based on actual database structure and data

-- Update Products table (image column contains just filenames like "1.jpg", "2.jpg", etc.)
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273491/stationery-mgmt/products/1.jpg' WHERE image = '1.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273507/stationery-mgmt/products/2.jpg' WHERE image = '2.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273521/stationery-mgmt/products/3.webp' WHERE image = '3.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273541/stationery-mgmt/products/4.jpg' WHERE image = '4.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273550/stationery-mgmt/products/5.jpg' WHERE image = '5.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273553/stationery-mgmt/products/6.jpg' WHERE image = '6.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273554/stationery-mgmt/products/7.jpg' WHERE image = '7.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273556/stationery-mgmt/products/8.jpg' WHERE image = '8.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273557/stationery-mgmt/products/9.jpg' WHERE image = '9.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273492/stationery-mgmt/products/10.jpg' WHERE image = '10.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273494/stationery-mgmt/products/11.jpg' WHERE image = '11.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273495/stationery-mgmt/products/12.jpg' WHERE image = '12.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273497/stationery-mgmt/products/13.webp' WHERE image = '13.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273498/stationery-mgmt/products/14.jpg' WHERE image = '14.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273500/stationery-mgmt/products/15.jpg' WHERE image = '15.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273502/stationery-mgmt/products/16.jpg' WHERE image = '16.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273503/stationery-mgmt/products/17.jpg' WHERE image = '17.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273505/stationery-mgmt/products/18.jpg' WHERE image = '18.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273509/stationery-mgmt/products/20.jpg' WHERE image = '20.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273511/stationery-mgmt/products/21.jpg' WHERE image = '21.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273513/stationery-mgmt/products/22.jpg' WHERE image = '22.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273515/stationery-mgmt/products/23.webp' WHERE image = '23.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273517/stationery-mgmt/products/24.jpg' WHERE image = '24.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273518/stationery-mgmt/products/25.webp' WHERE image = '25.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273520/stationery-mgmt/products/29.jpg' WHERE image = '29.jpg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273522/stationery-mgmt/products/30.webp' WHERE image = '30.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273524/stationery-mgmt/products/31.webp' WHERE image = '31.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273526/stationery-mgmt/products/32.webp' WHERE image = '32.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273528/stationery-mgmt/products/33.webp' WHERE image = '33.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273533/stationery-mgmt/products/35.webp' WHERE image = '35.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273535/stationery-mgmt/products/36.jpg' WHERE image = '36.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273536/stationery-mgmt/products/37.webp' WHERE image = '37.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273538/stationery-mgmt/products/38.webp' WHERE image = '38.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273539/stationery-mgmt/products/39.webp' WHERE image = '39.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273542/stationery-mgmt/products/40.webp' WHERE image = '40.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273544/stationery-mgmt/products/41.jpg' WHERE image = '41.jpeg';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273546/stationery-mgmt/products/42.webp' WHERE image = '42.webp';
UPDATE products SET image = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273548/stationery-mgmt/products/43.webp' WHERE image = '43.webp';

-- Update Categories table (icon column contains filenames like "1_adhesives and tapes.webp", etc.)
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273502/stationery-mgmt/categories/1_adhesives%20and%20tapes.webp' WHERE icon = '1_adhesives and tapes.webp';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273503/stationery-mgmt/categories/2_Envelopes.jpg' WHERE icon = '2_Envelopes.jpeg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273506/stationery-mgmt/categories/3_files%20and%20folders.jpg' WHERE icon = '3_files and folders.jpg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273509/stationery-mgmt/categories/5_whiteboard%20markers.png' WHERE icon = '5_whiteboard markers.png';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273512/stationery-mgmt/categories/7_highlighters.webp' WHERE icon = '7_highlighters.webp';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273514/stationery-mgmt/categories/8_erasers%20and%20correctors.jpg' WHERE icon = '8_erasers and correctors.jpg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273516/stationery-mgmt/categories/9_cutting%20and%20punching.jpg' WHERE icon = '9_cutting and punching.jpg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273492/stationery-mgmt/categories/11_sticky%20notes.jpg' WHERE icon = '11_sticky notes.jpg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273495/stationery-mgmt/categories/12_notebook.webp' WHERE icon = '12_notebook.webp';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273497/stationery-mgmt/categories/13_printing%20papers.jpg' WHERE icon = '13_printing papers.jpg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273498/stationery-mgmt/categories/14_rulers.jpg' WHERE icon = '14_rulers.jpg';
UPDATE categories SET icon = 'https://res.cloudinary.com/dha0szuzq/image/upload/v1751273500/stationery-mgmt/categories/15_miscellaneous.jpg' WHERE icon = '15_miscellaneous.jpg';

-- Note: Some categories are missing from the Cloudinary URLs provided:
-- - '4_Ball points & gel pens.webp' (category_id 4)
-- - '6_pencil & leads.webp' (category_id 6) 
-- - '10_Clips & Staplers.jpg' (category_id 10)
-- These will need to be uploaded to Cloudinary and added to this migration script.

-- Verification queries (run these after the migration to check results):
-- SELECT product_id, code, name, image FROM products WHERE image LIKE 'https://res.cloudinary.com%' LIMIT 10;
-- SELECT category_id, code, name_en, icon FROM categories WHERE icon LIKE 'https://res.cloudinary.com%';