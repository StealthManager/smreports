
-- Fix overly permissive INSERT policy on leads
DROP POLICY "Authenticated can insert leads" ON public.leads;
CREATE POLICY "Authenticated can insert leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'closer') OR
    closer_id IN (SELECT id FROM public.closers WHERE user_id = auth.uid())
  );
