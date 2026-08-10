-- Add new columns to existing orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_studio_order BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS studio_status TEXT DEFAULT NULL;

-- Create studio_order_items table
CREATE TABLE IF NOT EXISTS public.studio_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- Product info (from Qikink catalog)
  qikink_product_sku TEXT NOT NULL,
  qikink_product_name TEXT NOT NULL,
  qikink_collection TEXT NOT NULL,
  
  -- Design file (uploaded by user to Supabase storage)
  design_front_url TEXT,
  design_back_url TEXT,
  design_left_pocket_url TEXT,
  design_right_pocket_url TEXT,
  design_left_sleeve_url TEXT,
  
  -- Print configuration
  print_positions TEXT[] NOT NULL,
  printing_type TEXT NOT NULL,
  
  -- Product configuration
  selected_colors TEXT[] NOT NULL,
  product_base_color TEXT,
  
  -- Sizes and quantities (JSON map)
  sizes_quantities JSONB NOT NULL,
  
  -- Pricing
  qikink_base_price NUMERIC NOT NULL,
  print_finish TEXT DEFAULT 'DTG',
  
  -- Customer notes
  special_instructions TEXT,
  
  -- Admin tracking
  admin_notes TEXT,
  qikink_product_created BOOLEAN DEFAULT FALSE,
  qikink_order_placed BOOLEAN DEFAULT FALSE,
  qikink_order_number TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for studio_order_items
ALTER TABLE public.studio_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to studio_order_items"
ON public.studio_order_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can read their own studio_order_items"
ON public.studio_order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = studio_order_items.order_id AND user_id = auth.uid())
);

-- Set up studio-designs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-designs', 'studio-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up bucket policies
CREATE POLICY "Public Access Studio Designs"
ON storage.objects FOR SELECT
USING (bucket_id = 'studio-designs');

-- Allow authenticated users to upload to studio-designs (with anon access for guests checking out)
-- Since users might be guests before checkout, we allow INSERT to anyone (or we can lock to authenticated, 
-- but the spec allows anon users to create designs). Let's allow anon/authenticated insert for studio-designs.
CREATE POLICY "Public Insert Studio Designs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'studio-designs');

CREATE POLICY "Admin Update Studio Designs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'studio-designs' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete Studio Designs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'studio-designs' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can insert their own studio_order_items"
ON public.studio_order_items FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = studio_order_items.order_id AND user_id = auth.uid())
);
