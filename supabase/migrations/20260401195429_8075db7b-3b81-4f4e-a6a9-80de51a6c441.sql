
-- Allow anon (public) SELECT on dashboard tables
CREATE POLICY "Public can view ad_spend"
ON public.ad_spend FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view utm_performance"
ON public.utm_performance FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view leads"
ON public.leads FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view closers"
ON public.closers FOR SELECT
TO anon
USING (true);
