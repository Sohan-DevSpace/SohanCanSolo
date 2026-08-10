-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer'::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  base_price NUMERIC NOT NULL,
  selling_price NUMERIC NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  qikink_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. product_variants
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  stock INTEGER DEFAULT 100,
  qikink_variant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. designs
CREATE TABLE public.designs (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. product_designs
CREATE TABLE public.product_designs (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  preview_image_url TEXT
);

-- 7. cart_items
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. addresses
CREATE TABLE public.addresses (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending'::TEXT,
  payment_status TEXT DEFAULT 'pending'::TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  qikink_order_id TEXT,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_charge NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. order_items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  design_name TEXT,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  design_id_back UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  design_name_back TEXT
);


-- TRIGGERS & FUNCTIONS

-- Trigger: auto-create profile row on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger + function: auto-generate order_number on orders INSERT
-- Format: ORD-YYYYMMDD-NNNNN (padded 5-digit sequence)
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger AS $$
DECLARE
  date_part TEXT;
  seq_val TEXT;
BEGIN
  date_part := to_char(NOW(), 'YYYYMMDD');
  seq_val := lpad(nextval('order_number_seq')::TEXT, 5, '0');
  NEW.order_number := 'ORD-' || date_part || '-' || seq_val;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE PROCEDURE public.generate_order_number();

-- Update updated_at trigger for orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create an admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read/update their own profile. Admin full access.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do everything on profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories: Public read active, Admin full access.
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can do everything on categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products: Public read active, Admin full access.
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can do everything on products" ON public.products FOR ALL USING (public.is_admin());

-- Product Variants: Public read variants of active products, Admin full access.
CREATE POLICY "Public can view active product variants" ON public.product_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_active = TRUE)
);
CREATE POLICY "Admins can do everything on product variants" ON public.product_variants FOR ALL USING (public.is_admin());

-- Designs: Public read active, Admin full access.
CREATE POLICY "Public can view active designs" ON public.designs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can do everything on designs" ON public.designs FOR ALL USING (public.is_admin());

-- Product Designs: Public read active, Admin full access.
CREATE POLICY "Public can view product designs" ON public.product_designs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_active = TRUE)
  AND EXISTS (SELECT 1 FROM public.designs WHERE id = design_id AND is_active = TRUE)
);
CREATE POLICY "Admins can do everything on product designs" ON public.product_designs FOR ALL USING (public.is_admin());

-- Cart Items: Users full CRUD on own cart, Admin full access.
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can do everything on cart items" ON public.cart_items FOR ALL USING (public.is_admin());

-- Addresses: Users full CRUD on own addresses, Admin full access.
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can do everything on addresses" ON public.addresses FOR ALL USING (public.is_admin());

-- Orders: Users can view own orders, Admin full access.
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can do everything on orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items: Users view own order items, Admin full access.
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can do everything on order items" ON public.order_items FOR ALL USING (public.is_admin());
