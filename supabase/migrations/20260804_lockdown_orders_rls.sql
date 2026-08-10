-- Lock down Orders table
-- Previously: FOR ALL USING (auth.uid() = user_id)
-- This allowed clients to directly INSERT/UPDATE their own orders. We want API boundary enforcement.
DROP POLICY IF EXISTS "Users can manage own orders" ON public.orders;

CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins still have full access (already defined, but let's ensure it's there)
DROP POLICY IF EXISTS "Admins can do everything on orders" ON public.orders;
CREATE POLICY "Admins can do everything on orders" 
ON public.orders 
FOR ALL 
USING (public.is_admin());

-- Lock down Order Items table
-- Previously: FOR INSERT was allowed for users
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
-- Only select should be allowed
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- Note: All mutations (INSERT, UPDATE) on orders and order_items will now require the 
-- service_role key, which enforces that orders are processed safely through our secure 
-- API routes (`/api/orders/*`) rather than from client components.
