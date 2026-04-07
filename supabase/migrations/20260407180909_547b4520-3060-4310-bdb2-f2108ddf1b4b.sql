CREATE POLICY "Anon can insert recurring tags"
  ON public.recurring_revenue_tags FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Anon can delete recurring tags"
  ON public.recurring_revenue_tags FOR DELETE
  TO anon USING (true);