-- 1. Studio Categories Table
CREATE TABLE IF NOT EXISTS public.studio_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Studio Products Table
CREATE TABLE IF NOT EXISTS public.studio_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    collection TEXT REFERENCES public.studio_categories(id),
    gender TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    available_colors TEXT[] DEFAULT '{}',
    available_sizes TEXT[] DEFAULT '{}',
    print_positions TEXT[] DEFAULT '{}',
    printing_types TEXT[] DEFAULT '{}',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. FAQs Table
CREATE TABLE IF NOT EXISTS public.support_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: 'coupons' table already exists.

-- Disable RLS for read access on these public tables
ALTER TABLE public.studio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on studio_categories" ON public.studio_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on studio_products" ON public.studio_products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on support_faqs" ON public.support_faqs FOR SELECT USING (true);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert Studio Categories
INSERT INTO public.studio_categories (id, name, description, image, product_count)
VALUES
('tshirts', 'T-Shirts', 'Classic, oversized, crop tops, polo, raglan and more.', '/images/categories/tshirts.png', 27),
('hoodies', 'Hoodies & Jackets', 'Pullovers, zip hoodies, sweatshirts, bomber jackets.', '/images/categories/hoodies.png', 12),
('bottomwear', 'Bottomwear', 'Joggers, sweatpants, shorts and more.', '/images/categories/bottomwear.png', 6),
('kids', 'Kids Clothing', 'T-shirts and hoodies sized for children.', '/images/categories/kids.png', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert Studio Products
INSERT INTO public.studio_products (sku, name, collection, gender, base_price, available_colors, available_sizes, print_positions, printing_types)
VALUES
('US21', 'Male Standard Crew T-Shirt', 'tshirts', 'men', 170.00, ARRAY['White', 'Black'], ARRAY['S','M','L','XL','XXL'], ARRAY['front', 'back', 'left_pocket'], ARRAY['DTG', 'DTF']),
('UC22', 'Unisex Oversized Classic T-Shirt', 'tshirts', 'unisex', 265.00, ARRAY['White', 'Black', 'Grey', 'Navy'], ARRAY['S','M','L','XL','XXL'], ARRAY['front', 'back'], ARRAY['DTG', 'DTF']),
('FT47', 'Female Baby Tee', 'tshirts', 'women', 180.00, ARRAY['White', 'Black', 'Pink'], ARRAY['XS','S','M','L','XL'], ARRAY['front', 'back'], ARRAY['DTG'])
ON CONFLICT (sku) DO NOTHING;

-- Insert FAQs
INSERT INTO public.support_faqs (category, question, answer, sort_order)
VALUES
('Orders, Delivery & Payments', 'How do I track my order?', 'You can track your order by navigating to the ''Track Orders'' section in your Account Activity. Once your order ships, a tracking link will be provided along with email notifications.', 1),
('Orders, Delivery & Payments', 'Can I modify or cancel my order?', 'Orders can only be modified or cancelled within 2 hours of placement. Please contact our support team immediately if you need to make changes.', 2),
('Orders, Delivery & Payments', 'Are my payment details secure?', 'Yes, all payments are processed through bank-grade encryption using our certified payment gateways. We do not store your full credit card details on our servers.', 3),
('Custom Design Studio', 'How does the Design Studio work?', 'It''s easy! Head over to our "Create Your Own" studio, select the base product (like a Hoodie or Mug), upload your high-resolution artwork (PNG/JPEG), adjust its positioning using our live drag-and-drop mockup generator, and add it straight to your cart. We will print it exactly as previewed.', 1),
('Custom Design Studio', 'What file types are supported?', 'We support high-resolution PNG (recommended for transparency), JPEG, and WebP formats. Please ensure your images are at least 300 DPI for the best print quality.', 2),
('Returns & Refunds', 'What is your return policy?', 'We offer a 14-day return policy for standard catalog items. However, custom printed items from our Design Studio are non-refundable unless there is a manufacturing defect or printing error.', 1),
('Returns & Refunds', 'How long do refunds take?', 'Once approved, refunds are processed within 5-7 business days directly to your original payment method.', 2);

-- Insert Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, expires_at, usage_limit, is_active)
VALUES
('WELCOME10', 'percentage', 10, 0, '2026-12-31 23:59:59', 1, true),
('STUDIO25', 'percentage', 25, 0, '2026-12-31 23:59:59', 1, true),
('FREESHIP', 'fixed', 0, 500, '2026-12-31 23:59:59', NULL, true)
ON CONFLICT (code) DO NOTHING;
