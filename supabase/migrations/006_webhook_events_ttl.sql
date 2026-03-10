-- Index for efficient cleanup of old webhook events
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON stripe_webhook_events (processed_at);

-- Cron job to purge webhook events older than 7 days (requires pg_cron extension)
-- pg_cron is available on Supabase Pro plans
SELECT cron.schedule(
  'cleanup-stripe-webhook-events',
  '0 3 * * *',  -- daily at 3am UTC
  $$DELETE FROM stripe_webhook_events WHERE processed_at < now() - interval '7 days'$$
);
