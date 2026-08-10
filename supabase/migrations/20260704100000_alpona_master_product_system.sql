-- ALPONA Master Product Management System (Version 1)
-- Migration Script

-- Create Enums
CREATE TYPE product_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE profit_rule_type AS ENUM ('FIXED', 'PERCENTAGE');
CREATE TYPE media_type AS ENUM ('THUMBNAIL', 'GALLERY', 'LIFESTYLE', 'VIDEO', '360');
CREATE TYPE provider_id_enum AS ENUM ('QIKINK', 'PRINTROVE', 'MANUAL');
CREATE TYPE order_status_enum AS ENUM ('PENDING', 'APPROVED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED');

-- 1. Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Collections
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Types
-- Defines the physical properties and constraints of a product category.
CREATE TABLE IF NOT EXISTS public.product_types (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  material TEXT,
  weight TEXT,
  shipping_weight NUMERIC,
  canvas_width NUMERIC,
  canvas_height NUMERIC,
  safe_zone_data JSONB,
  mockup_template_url TEXT,
  default_cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We are altering existing `products` table if it exists or creating a new one. 
-- For a safe migration in this context, we will rename the old ones and create new ones.
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'products') THEN
    ALTER TABLE public.products RENAME TO old_products;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'product_variants') THEN
    ALTER TABLE public.product_variants RENAME TO old_product_variants;
  END IF;
END $$;

-- 4. Products (Master Record)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_type_id UUID REFERENCES public.product_types(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  long_description TEXT,
  status product_status DEFAULT 'DRAFT',
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  seo_title TEXT,
  seo_description TEXT,
  base_cost NUMERIC NOT NULL DEFAULT 0,
  profit_rule_type profit_rule_type DEFAULT 'FIXED',
  profit_value NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Variants (Auto-generated combinations)
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price_override NUMERIC,
  inventory_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color, size)
);

-- 6. Product Media
CREATE TABLE public.product_media (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type media_type DEFAULT 'GALLERY',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Provider Mappings (The Abstraction Layer)
CREATE TABLE public.provider_mappings (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  provider_id provider_id_enum NOT NULL,
  external_product_id TEXT NOT NULL,
  external_variant_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_variant_id, provider_id)
);

-- 8. Customer Designs
CREATE TABLE public.customer_designs (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  canvas_json JSONB NOT NULL,
  print_ready_url TEXT,
  mockup_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Product Tags (Many-to-Many)
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.product_tags (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- Add Updated At Triggers
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON public.product_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_provider_mappings_updated_at BEFORE UPDATE ON public.provider_mappings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customer_designs_updated_at BEFORE UPDATE ON public.customer_designs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Public Read, Admin Write for catalog)
CREATE POLICY "Allow public read-only access to brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_types" ON public.product_types FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to products" ON public.products FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Allow public read-only access to product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_media" ON public.product_media FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_tags" ON public.product_tags FOR SELECT USING (true);

-- Customer Designs Policies (Users can read/write their own)
CREATE POLICY "Users can manage their own designs" ON public.customer_designs 
  FOR ALL USING (auth.uid() = customer_id);
