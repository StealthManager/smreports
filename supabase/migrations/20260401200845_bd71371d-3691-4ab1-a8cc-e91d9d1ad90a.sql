
-- Add level and hierarchy columns to utm_performance
ALTER TABLE public.utm_performance 
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'ad',
  ADD COLUMN IF NOT EXISTS campaign_name text,
  ADD COLUMN IF NOT EXISTS adset_name text;

-- Drop old unique constraint and create new one with level
ALTER TABLE public.utm_performance DROP CONSTRAINT IF EXISTS utm_performance_utm_month_key;
ALTER TABLE public.utm_performance ADD CONSTRAINT utm_performance_utm_month_level_key UNIQUE (utm, month, level);

-- Add index for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_utm_perf_level ON public.utm_performance (level);
CREATE INDEX IF NOT EXISTS idx_utm_perf_campaign ON public.utm_performance (campaign_name);
