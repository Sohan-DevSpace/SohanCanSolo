-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_collections table
CREATE TABLE IF NOT EXISTS public.product_collections (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, collection_id)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- Set RLS Policies
DROP POLICY IF EXISTS "Public can view active collections" ON public.collections;
CREATE POLICY "Public can view active collections" ON public.collections
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can do everything on collections" ON public.collections;
CREATE POLICY "Admins can do everything on collections" ON public.collections
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view product collections" ON public.product_collections;
CREATE POLICY "Public can view product collections" ON public.product_collections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND is_active = TRUE)
    AND EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND is_active = TRUE)
  );

DROP POLICY IF EXISTS "Admins can do everything on product collections" ON public.product_collections;
CREATE POLICY "Admins can do everything on product collections" ON public.product_collections
  FOR ALL USING (public.is_admin());
