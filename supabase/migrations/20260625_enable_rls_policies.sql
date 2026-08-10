-- Enable Row Level Security (RLS) on all 11 tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailing_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;

-- 1. Coupons Policies
-- Public can check if coupon exists/is active; Admin has full access.
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can do everything on coupons" ON public.coupons;
CREATE POLICY "Admins can do everything on coupons" ON public.coupons FOR ALL USING (public.is_admin());


-- 2. Reviews Policies
-- Public can read approved reviews; users can manage their own reviews; Admins have full access.
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can do everything on reviews" ON public.reviews;
CREATE POLICY "Admins can do everything on reviews" ON public.reviews FOR ALL USING (public.is_admin());


-- 3. Support Tickets Policies
-- Users can view and manage their own tickets; Admins have full access.
DROP POLICY IF EXISTS "Users can manage own support tickets" ON public.support_tickets;
CREATE POLICY "Users can manage own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can do everything on support tickets" ON public.support_tickets;
CREATE POLICY "Admins can do everything on support tickets" ON public.support_tickets FOR ALL USING (public.is_admin());


-- 4. Ticket Messages Policies
-- Users can view and send messages belonging to their support tickets; Admins have full access.
DROP POLICY IF EXISTS "Users can view own ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can insert own ticket messages" ON public.ticket_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can do everything on ticket messages" ON public.ticket_messages;
CREATE POLICY "Admins can do everything on ticket messages" ON public.ticket_messages FOR ALL USING (public.is_admin());


-- 5. FAQs Policies
-- Anyone can view FAQs; Admins have full access.
DROP POLICY IF EXISTS "Public can view faqs" ON public.faqs;
CREATE POLICY "Public can view faqs" ON public.faqs FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can do everything on faqs" ON public.faqs;
CREATE POLICY "Admins can do everything on faqs" ON public.faqs FOR ALL USING (public.is_admin());


-- 6. Blogs Policies
-- Public can view published blogs; Admins have full access.
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Admins can do everything on blogs" ON public.blogs;
CREATE POLICY "Admins can do everything on blogs" ON public.blogs FOR ALL USING (public.is_admin());


-- 7. Store Settings Policies
-- Public can view store settings (themes, metadata, etc.); Admins have full access.
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can do everything on store settings" ON public.store_settings;
CREATE POLICY "Admins can do everything on store settings" ON public.store_settings FOR ALL USING (public.is_admin());


-- 8. Finance Transactions Policies
-- Only Admins can view/manage transactions.
DROP POLICY IF EXISTS "Admins can do everything on finance transactions" ON public.finance_transactions;
CREATE POLICY "Admins can do everything on finance transactions" ON public.finance_transactions FOR ALL USING (public.is_admin());


-- 9. Mailing List Policies
-- Anyone can sign up/subscribe; Admins have full access.
DROP POLICY IF EXISTS "Anyone can subscribe to mailing list" ON public.mailing_list;
CREATE POLICY "Anyone can subscribe to mailing list" ON public.mailing_list FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can do everything on mailing list" ON public.mailing_list;
CREATE POLICY "Admins can do everything on mailing list" ON public.mailing_list FOR ALL USING (public.is_admin());


-- 10. Marketing Campaigns Policies
-- Only Admins can manage marketing campaigns.
DROP POLICY IF EXISTS "Admins can do everything on marketing campaigns" ON public.marketing_campaigns;
CREATE POLICY "Admins can do everything on marketing campaigns" ON public.marketing_campaigns FOR ALL USING (public.is_admin());


-- 11. Team Roles Policies
-- Public/Authenticated users can view team roles; Admins have full access.
DROP POLICY IF EXISTS "Public can view team roles" ON public.team_roles;
CREATE POLICY "Public can view team roles" ON public.team_roles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can do everything on team roles" ON public.team_roles;
CREATE POLICY "Admins can do everything on team roles" ON public.team_roles FOR ALL USING (public.is_admin());
