
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create daily cron job to sync GHL at 6:00 AM UTC
SELECT cron.schedule(
  'daily-ghl-sync',
  '0 6 * * *',
  $$
  SELECT extensions.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/ghl-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
    ),
    body := '{"locationId":"jsauqaKSnuB5fJ4pt5JG","pipelineId":"uP4c8hW4lt1AhQbW2DS5"}'::jsonb
  );
  $$
);
