-- 005_stripe_subscriptions.sql
-- Stripe subscription infrastructure for Wan2Fit Premium

-- ─── stripe_customers: mapping user ↔ Stripe customer ───
CREATE TABLE IF NOT EXISTS stripe_customers (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stripe customer"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

-- ─── subscriptions: full subscription state ───
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT NOT NULL UNIQUE,
  stripe_price_id         TEXT NOT NULL,
  status                  TEXT NOT NULL CHECK (status IN (
    'active', 'past_due', 'canceled', 'incomplete',
    'incomplete_expired', 'trialing', 'unpaid', 'paused'
  )),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  canceled_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ─── stripe_webhook_events: idempotency ───
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id           TEXT PRIMARY KEY,  -- Stripe event ID (evt_xxx)
  type         TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS — service role only

-- ─── profiles: add subscription_tier ───
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'premium'));
