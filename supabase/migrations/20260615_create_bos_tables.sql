-- 1. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'percentage', 'fixed_discount', 'free_shipping'
    value NUMERIC NOT NULL DEFAULT 0,
    min_purchase_amount NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Coupons
INSERT INTO public.coupons (code, type, value, min_purchase_amount, is_active, usage_limit, usage_count, expiry_date)
VALUES 
('BONGVIBES', 'percentage', 15.00, 499.00, true, 200, 45, now() + interval '30 days'),
('FIRSTBUY', 'fixed_discount', 100.00, 599.00, true, 500, 120, now() + interval '60 days'),
('FREESHIP399', 'free_shipping', 0.00, 399.00, true, NULL, 312, now() + interval '120 days'),
('FESTIVE25', 'percentage', 25.00, 999.00, true, 100, 12, now() + interval '10 days'),
('EXPIRED10', 'percentage', 10.00, 0.00, false, 50, 50, now() - interval '2 days')
ON CONFLICT (code) DO NOTHING;


-- 2. Reviews Table (for moderation and user photos)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Reviews
INSERT INTO public.reviews (user_id, product_id, rating, comment, images, status, created_at)
VALUES
('c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', '353ef5fc-6749-46b5-b255-589c68a61922', 5, 'Absolutely love the fabric quality! The printed design is super crisp and holds up after multiple washes.', ARRAY['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400'], 'approved', now() - interval '5 days'),
('199df7c0-635e-46a2-8b42-eae99b549be6', 'f062efcb-13a9-4529-8c3b-f4f0dc378cb0', 4, 'Very comfortable hoodie. Keeps warm and colors are identical to mockups. Dropped one star because shipping took 4 days.', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'], 'approved', now() - interval '3 days'),
('c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', '288ad222-a669-491c-87b4-ad21032577f4', 5, 'Perfect white mug. Print covers the full ceramic area perfectly without jagged edges.', ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400'], 'pending', now() - interval '1 day'),
('199df7c0-635e-46a2-8b42-eae99b549be6', 'ed2d980f-c8c1-4728-a99b-566cba15606d', 2, 'Size runs small, design is okay but need a replacement. Contacted support.', '{}', 'pending', now() - interval '6 hours')
ON CONFLICT DO NOTHING;


-- 3. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'pending', 'closed'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Support Tickets
INSERT INTO public.support_tickets (id, user_id, subject, message, status, priority, created_at)
VALUES
('a7d8e2cf-3d84-482d-862d-20923d8c1c4f', 'c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', 'Wrong shipping address on Order #ALP-1042', 'Hi, I accidentally entered my old home address for order #ALP-1042. Can you update it to my new flat details before it syncs to printing?', 'open', 'high', now() - interval '2 hours'),
('b5c9d4ff-f6a2-4a2e-8cf4-ea66b549be61', '199df7c0-635e-46a2-8b42-eae99b549be6', 'Refund inquiry for Failed Payment', 'My card was charged but the order shows as draft/failed. Please refund or create the order manually. Razorpay ref pay_Pj823kd.', 'pending', 'medium', now() - interval '1 day'),
('e32df7c0-23a5-48b4-92c2-be99b549be32', 'c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', 'Qikink manufacturer tracking delay', 'The order has been shipped but the tracking link throws an invalid code error on DTDC website.', 'closed', 'low', now() - interval '4 days')
ON CONFLICT (id) DO NOTHING;


-- 4. Ticket Messages (for thread dialogue)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_role TEXT NOT NULL, -- 'admin', 'customer'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Ticket Messages
INSERT INTO public.ticket_messages (ticket_id, sender_id, sender_role, message, created_at)
VALUES
('a7d8e2cf-3d84-482d-862d-20923d8c1c4f', 'c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', 'customer', 'Hi, I accidentally entered my old home address for order #ALP-1042. Can you update it to my new flat details before it syncs to printing?', now() - interval '2 hours'),
('b5c9d4ff-f6a2-4a2e-8cf4-ea66b549be61', '199df7c0-635e-46a2-8b42-eae99b549be6', 'customer', 'My card was charged but the order shows as draft/failed. Please refund or create the order manually. Razorpay ref pay_Pj823kd.', now() - interval '1 day'),
('b5c9d4ff-f6a2-4a2e-8cf4-ea66b549be61', 'c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', 'admin', 'Hi Sohan, checking your transaction details. The Razorpay payout is in capture state. I am creating a manual order for you now.', now() - interval '18 hours'),
('e32df7c0-23a5-48b4-92c2-be99b549be32', 'c0b6d4df-ed1c-4bb1-bd1c-ee8904324c44', 'customer', 'The order has been shipped but the tracking link throws an invalid code error on DTDC website.', now() - interval '4 days'),
('e32df7c0-23a5-48b4-92c2-be99b549be32', '199df7c0-635e-46a2-8b42-eae99b549be6', 'admin', 'We contacted DTDC, their regional manifest API was down. The code is active now. Closing ticket.', now() - interval '3 days')
ON CONFLICT DO NOTHING;


-- 5. FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Shipping', 'Returns', 'Products', 'Customizer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed FAQs
INSERT INTO public.faqs (question, answer, category, created_at)
VALUES
('How long does shipping take?', 'It takes 1-2 days for printing/packing and 3-5 business days for transit depending on delivery pin code.', 'Shipping', now()),
('Can I return a customized t-shirt?', 'Since custom products are printed specifically for you, we only accept returns if there is a manufacturing defect or printing print error.', 'Returns', now()),
('What file formats can I upload in the Customizer?', 'You can upload high-resolution PNG or JPEG files. For best print results, we recommend PNG files with transparent backgrounds at 300 DPI.', 'Customizer', now()),
('Do you offer cash on delivery (COD)?', 'Currently, we support card payments, UPI, Netbanking, and Wallets securely via Razorpay.', 'Payments', now())
ON CONFLICT DO NOTHING;


-- 6. Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Blogs
INSERT INTO public.blogs (title, slug, content, excerpt, cover_image, is_published, created_at)
VALUES
('10 Bengali Typography T-Shirt Trends in 2026', 'bengali-typography-shirt-trends', 'Explore the rising wave of Bengali culture slogans, minimal calligraphies, and fusion artworks inside print-on-demand designs.', 'Bengali typography styles are taking over streetwear. Here are the top 10 concepts driving sales in 2026.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600', true, now() - interval '7 days'),
('Scaling Your Custom T-Shirt Brand With Qikink Integration', 'scale-tshirt-brand-qikink', 'Step by step playbook on setting up automated order sync with Qikink, tracking warehousing inventories, and scaling without capital overheads.', 'How we integrated Qikink APIs to build automated fulfillment pipes that scale effortlessly.', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600', true, now() - interval '2 days'),
('Launching Alpona Art Apparel Collection', 'launching-alpona-apparel', 'Behind the scenes draft of Alpona creative heritage collection. Exploring local artistry on high grade combed cotton.', 'A sneak peek into the classic handpainted digital motifs coming to crewnecks next month.', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600', false, now())
ON CONFLICT (slug) DO NOTHING;


-- 7. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY,
    store_name TEXT DEFAULT 'Alpona',
    logo_url TEXT,
    contact_email TEXT DEFAULT 'support@alpona.com',
    contact_phone TEXT DEFAULT '+91 98765 43210',
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT,
    qikink_api_key TEXT,
    qikink_webhook_secret TEXT,
    tax_percentage NUMERIC NOT NULL DEFAULT 18.00,
    theme_settings JSONB NOT NULL DEFAULT '{"primaryColor": "#C87533", "darkMode": true}'::jsonb,
    seo_settings JSONB NOT NULL DEFAULT '{"title": "Alpona - Premium Custom Apparels", "description": "Custom printed high-fidelity streetwear"}'::jsonb,
    hero_settings JSONB NOT NULL DEFAULT '{"title": "Wear Your Identity", "subtitle": "Premium Bengali, Anime, and custom printed t-shirts", "buttonText": "Start Designing"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Store Settings
INSERT INTO public.store_settings (id, store_name, logo_url, contact_email, contact_phone, tax_percentage)
VALUES 
('global', 'Alpona', 'https://alpona.com/logo.png', 'support@alpona.com', '+91 98765 43210', 18.00)
ON CONFLICT (id) DO NOTHING;


-- 8. Finance Transactions
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    razorpay_payment_id TEXT UNIQUE,
    amount NUMERIC NOT NULL DEFAULT 0,
    fee NUMERIC NOT NULL DEFAULT 0,
    type TEXT NOT NULL, -- 'payment', 'refund'
    status TEXT NOT NULL, -- 'captured', 'failed', 'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Transactions
INSERT INTO public.finance_transactions (razorpay_payment_id, amount, fee, type, status, created_at)
VALUES
('pay_Pl839djk', 799.00, 15.98, 'payment', 'captured', now() - interval '4 hours'),
('pay_Pl842mlk', 1249.00, 24.98, 'payment', 'captured', now() - interval '8 hours'),
('pay_Pk312oip', 699.00, 13.98, 'payment', 'captured', now() - interval '1 day'),
('pay_Pk300ref', 799.00, 15.98, 'refund', 'refunded', now() - interval '2 days'),
('pay_Pj823kd', 999.00, 0.00, 'payment', 'failed', now() - interval '3 days')
ON CONFLICT (razorpay_payment_id) DO NOTHING;


-- 9. Mailing List Table
CREATE TABLE IF NOT EXISTS public.mailing_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Mailing List
INSERT INTO public.mailing_list (email, subscribed)
VALUES
('arghya@gmail.com', true),
('souvik_roy@yahoo.com', true),
('mousumi_bose@outlook.com', true),
('debasish_sen@gmail.com', false),
('koushik@devspace.io', true)
ON CONFLICT (email) DO NOTHING;


-- 10. Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Campaigns
INSERT INTO public.marketing_campaigns (title, subject, content, sent_count, status)
VALUES
('Summer Launch Promotion', '☀️ Beat the Heat: 15% OFF Bengali Typography Tees!', 'Hey Alpona Fam, our summer collection of lightweight premium tees is live now! Use code SUMMER15 for exclusive checkout discounts.', 350, 'sent'),
('Cart Recovery Automation Template', 'You left something beautiful behind...', 'Hi {{name}}, we saved the custom designs you left in your shopping cart. Click here to check out now and get 5% discount.', 0, 'draft'),
('Durga Puja Pre-Launch Sneakpeek', '🔱 Sharadiya 2026: The Alpona Heritage Collection', 'Namaskar, we are revealing our signature hand-painted digital collections next Tuesday. Be the first to grab early bird variants.', 0, 'draft')
ON CONFLICT DO NOTHING;


-- 11. Team Roles Permissions Table
CREATE TABLE IF NOT EXISTS public.team_roles (
    role_name TEXT PRIMARY KEY,
    permissions TEXT[] NOT NULL DEFAULT '{}'
);

-- Seed Team Roles
INSERT INTO public.team_roles (role_name, permissions)
VALUES
('owner', ARRAY['orders', 'products', 'analytics', 'customers', 'designs', 'finance', 'marketing', 'support', 'content', 'team', 'settings']),
('admin', ARRAY['orders', 'products', 'analytics', 'customers', 'designs', 'finance', 'marketing', 'support', 'content', 'settings']),
('manager', ARRAY['orders', 'products', 'customers', 'designs', 'support']),
('designer', ARRAY['designs', 'products']),
('support', ARRAY['orders', 'support'])
ON CONFLICT (role_name) DO NOTHING;
