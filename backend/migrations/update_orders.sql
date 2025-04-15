-- Xóa các cột cũ nếu tồn tại
ALTER TABLE orders 
  DROP COLUMN IF EXISTS delivery_address,
  DROP COLUMN IF EXISTS customer_phone,
  DROP COLUMN IF EXISTS customer_name,
  DROP COLUMN IF EXISTS customer_email,
  DROP COLUMN IF EXISTS notes;

-- Thêm các cột mới
ALTER TABLE orders 
  ADD COLUMN delivery_address VARCHAR(255),
  ADD COLUMN customer_phone VARCHAR(255),
  ADD COLUMN customer_name VARCHAR(255),
  ADD COLUMN customer_email VARCHAR(255),
  ADD COLUMN notes TEXT;

-- Cập nhật dữ liệu
UPDATE orders 
SET 
  delivery_address = shipping_address,
  customer_phone = phone,
  customer_name = (SELECT full_name FROM users WHERE users.id = orders.user_id),
  customer_email = (SELECT email FROM users WHERE users.id = orders.user_id),
  notes = '';

-- Đặt các cột thành NOT NULL
ALTER TABLE orders 
  ALTER COLUMN delivery_address SET NOT NULL,
  ALTER COLUMN customer_phone SET NOT NULL,
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN customer_email SET NOT NULL; 