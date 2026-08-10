-- Create avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set it to public
update storage.buckets
set public = true
where id = 'avatars';

-- RLS for avatars bucket
-- Public can read
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can insert their own avatar
CREATE POLICY "Users Insert Avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'avatars' -- optional restrict folder
);

-- Authenticated users can update their own avatar
CREATE POLICY "Users Update Avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can delete their own avatar
CREATE POLICY "Users Delete Avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
