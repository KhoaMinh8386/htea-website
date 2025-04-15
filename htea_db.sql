-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.product_categories CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Tạo function để cập nhật timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo bảng users
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    avatar_url TEXT
);

-- Tạo bảng product_categories
CREATE TABLE public.product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tạo bảng products
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES public.product_categories(id),
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tạo bảng orders
CREATE TABLE public.orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tạo bảng order_items
CREATE TABLE public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(id),
    product_id INTEGER REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng reviews
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id),
    product_id INTEGER REFERENCES public.products(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Tạo bảng user_sessions
CREATE TABLE public.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo các indexes
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);

-- Tạo triggers cho cập nhật timestamp
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Thêm dữ liệu mẫu
-- Admin user
INSERT INTO public.users (username, email, password, role, full_name)
VALUES (
    'admin',
    'admin@example.com',
    '$2b$10$b1RupzapSjRM2SVyv535KOqzBu2eqdy2ZkaEvVegu7QnyaZQEuuJy',
    'admin',
    'Administrator'
);

-- Categories
INSERT INTO public.product_categories (name, description) VALUES
('Trà Xanh', 'Các loại trà xanh thơm ngon'),
('Trà Oolong', 'Trà Oolong đặc sản'),
('Trà Đen', 'Trà đen truyền thống'),
('Trà Thảo Mộc', 'Các loại trà thảo mộc'),
('Trà Hoa', 'Trà hoa thơm ngát');

-- Products
INSERT INTO public.products (name, description, price, stock_quantity, category_id, image_url) VALUES
('Trà Xanh Thái Nguyên', 'Trà xanh thơm ngon từ Thái Nguyên', 150000, 100, 1, 'green-tea.jpg'),
('Trà Oolong Sữa', 'Trà Oolong sữa đặc sản', 200000, 80, 2, 'milk-oolong.jpg'),
('Trà Đen Earl Grey', 'Trà đen Earl Grey truyền thống', 180000, 90, 3, 'earl-grey.jpg'),
('Trà Hoa Cúc', 'Trà hoa cúc thơm ngát', 120000, 120, 5, 'chamomile.jpg'),
('Trà Gừng', 'Trà gừng thảo mộc', 100000, 150, 4, 'ginger-tea.jpg');

-- Cập nhật sequences
SELECT setval('public.users_id_seq', (SELECT MAX(id) FROM public.users));
SELECT setval('public.product_categories_id_seq', (SELECT MAX(id) FROM public.product_categories));
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));
SELECT setval('public.orders_id_seq', (SELECT MAX(id) FROM public.orders));
SELECT setval('public.order_items_id_seq', (SELECT MAX(id) FROM public.order_items));
SELECT setval('public.reviews_id_seq', (SELECT MAX(id) FROM public.reviews));
SELECT setval('public.user_sessions_id_seq', (SELECT MAX(id) FROM public.user_sessions)); 