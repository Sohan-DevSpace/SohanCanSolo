-- Migration to add 'seller' role to team_roles and profiles, and update RLS policies for seller product uploads

-- 1. Insert 'seller' role into team_roles table if it exists
INSERT INTO public.team_roles (role_name, permissions)
VALUES ('seller', '["products.create", "products.read", "products.update"]')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Allow Admins to update any profile role
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Allow sellers to insert & update products
DROP POLICY IF EXISTS "Sellers and Admins can insert products" ON public.products;
CREATE POLICY "Sellers and Admins can insert products" ON public.products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seller')
  )
);

DROP POLICY IF EXISTS "Sellers and Admins can update products" ON public.products;
CREATE POLICY "Sellers and Admins can update products" ON public.products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seller')
  )
);

-- 4. Allow sellers to insert & update product variants
DROP POLICY IF EXISTS "Sellers and Admins can insert variants" ON public.product_variants;
CREATE POLICY "Sellers and Admins can insert variants" ON public.product_variants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seller')
  )
);

DROP POLICY IF EXISTS "Sellers and Admins can update variants" ON public.product_variants;
CREATE POLICY "Sellers and Admins can update variants" ON public.product_variants
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seller')
  )
);
