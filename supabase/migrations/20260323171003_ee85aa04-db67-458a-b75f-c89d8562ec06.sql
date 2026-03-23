-- Unique constraint on ghl_contact_id for upsert deduplication
CREATE UNIQUE INDEX IF NOT EXISTS leads_ghl_contact_id_unique ON public.leads (ghl_contact_id) WHERE ghl_contact_id IS NOT NULL;

-- Unique constraint on ad_spend for channel+month+product upsert
CREATE UNIQUE INDEX IF NOT EXISTS ad_spend_channel_month_product_unique ON public.ad_spend (channel, month, product);

-- Unique constraint on utm_performance for utm+month upsert
CREATE UNIQUE INDEX IF NOT EXISTS utm_performance_utm_month_unique ON public.utm_performance (utm, month);