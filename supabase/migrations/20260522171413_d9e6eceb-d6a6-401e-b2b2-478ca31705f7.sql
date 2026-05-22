CREATE TABLE public.referral_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral links" ON public.referral_links FOR SELECT USING (true);
CREATE POLICY "Anyone can insert referral links" ON public.referral_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete referral links" ON public.referral_links FOR DELETE USING (true);