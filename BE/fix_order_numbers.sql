-- Fix null order numbers in existing orders
UPDATE orders 
SET order_number = CONCAT('ORD-', UPPER(SUBSTRING(d.name, 1, 3)), '-', EXTRACT(EPOCH FROM created_at)::bigint, '-', LPAD(order_id::text, 4, '0'))
FROM departments d 
WHERE orders.department_id = d.department_id 
AND orders.order_number IS NULL;

-- Verify the update
SELECT order_id, order_number, created_at FROM orders WHERE order_number IS NOT NULL LIMIT 10;