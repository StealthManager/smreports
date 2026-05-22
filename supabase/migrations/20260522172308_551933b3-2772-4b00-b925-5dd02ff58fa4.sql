
ALTER TABLE public.referral_links
  ADD COLUMN IF NOT EXISTS short_slug text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_clicked_at timestamptz;

-- Backfill slugs for existing rows
UPDATE public.referral_links
SET short_slug = substr(replace(encode(gen_random_bytes(6), 'base64'), '/', 'a'), 1, 6)
WHERE short_slug IS NULL;

ALTER TABLE public.referral_links
  ALTER COLUMN short_slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS referral_links_short_slug_key
  ON public.referral_links(short_slug);

-- Allow public updates (toggle active, increment clicks)
CREATE POLICY "Anyone can update referral links"
ON public.referral_links
FOR UPDATE
USING (true)
WITH CHECK (true);

-- RPC to increment click count atomically and return the URL if active
CREATE OR REPLACE FUNCTION public.resolve_referral_slug(_slug text)
RETURNS TABLE(url text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.referral_links r
  SET click_count = r.click_count + 1,
      last_clicked_at = now()
  WHERE r.short_slug = _slug AND r.is_active = true
  RETURNING r.url, r.is_active;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT r.url, r.is_active FROM public.referral_links r WHERE r.short_slug = _slug;
  END IF;
END;
$$;
