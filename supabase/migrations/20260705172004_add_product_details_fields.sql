ALTER TABLE products
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS compare_at_price numeric,
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS material_info text,
ADD COLUMN IF NOT EXISTS product_care_info text,
ADD COLUMN IF NOT EXISTS product_highlights jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_bestseller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false;
