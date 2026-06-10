
CREATE TABLE public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id uuid NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  short_slug text NOT NULL,
  user_agent text,
  referer text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_clicks_link_id ON public.referral_clicks(referral_link_id, clicked_at DESC);
CREATE INDEX idx_referral_clicks_clicked_at ON public.referral_clicks(clicked_at DESC);

GRANT SELECT ON public.referral_clicks TO anon;
GRANT SELECT, INSERT ON public.referral_clicks TO authenticated;
GRANT ALL ON public.referral_clicks TO service_role;

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view referral clicks"
  ON public.referral_clicks FOR SELECT
  USING (true);

CREATE POLICY "Service role inserts referral clicks"
  ON public.referral_clicks FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.resolve_referral_slug(
  _slug text,
  _user_agent text DEFAULT NULL,
  _referer text DEFAULT NULL
)
RETURNS TABLE(url text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _link_id uuid;
  _url text;
  _is_active boolean;
BEGIN
  SELECT r.id, r.url, r.is_active
    INTO _link_id, _url, _is_active
    FROM public.referral_links r
   WHERE r.short_slug = _slug;

  IF _link_id IS NULL THEN
    RETURN;
  END IF;

  IF _is_active THEN
    UPDATE public.referral_links
       SET click_count = click_count + 1,
           last_clicked_at = now()
     WHERE id = _link_id;

    INSERT INTO public.referral_clicks (referral_link_id, short_slug, user_agent, referer)
    VALUES (_link_id, _slug, _user_agent, _referer);
  END IF;

  RETURN QUERY SELECT _url, _is_active;
END;
$function$;
