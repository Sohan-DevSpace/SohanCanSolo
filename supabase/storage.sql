-- Insert buckets
insert into storage.buckets (id, name, public)
values 
  ('products', 'products', true),
  ('designs', 'designs', true),
  ('categories', 'categories', true)
on conflict (id) do nothing;

-- Set them to public explicitly (if they were created as private)
update storage.buckets
set public = true
where id in ('products', 'designs', 'categories');

-- RLS for storage.objects
-- Note: 'storage.objects' policies determine file-level access

-- 1. Products Bucket Policies
CREATE POLICY "Public Access Products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admin Insert Products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update Products"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete Products"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Designs Bucket Policies
CREATE POLICY "Public Access Designs"
ON storage.objects FOR SELECT
USING (bucket_id = 'designs');

CREATE POLICY "Admin Insert Designs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'designs' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update Designs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'designs' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete Designs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'designs' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Categories Bucket Policies
CREATE POLICY "Public Access Categories"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

CREATE POLICY "Admin Insert Categories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'categories' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update Categories"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'categories' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete Categories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'categories' AND 
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
