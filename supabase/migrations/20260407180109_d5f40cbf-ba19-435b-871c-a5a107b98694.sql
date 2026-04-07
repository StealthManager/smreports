CREATE TABLE public.recurring_revenue_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_revenue_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view recurring tags"
  ON public.recurring_revenue_tags FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Anon can view recurring tags"
  ON public.recurring_revenue_tags FOR SELECT
  TO anon USING (true);

CREATE POLICY "Admins can manage recurring tags"
  ON public.recurring_revenue_tags FOR ALL
  TO public USING (has_role(auth.uid(), 'admin'::app_role));