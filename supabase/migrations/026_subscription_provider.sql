-- Migration 026 — subscription_provider column on profiles
--
-- Context: with IAP iOS (RevenueCat) coexisting with Stripe web checkout,
-- the same user could in principle become premium via either path. We need
-- to know which channel granted the entitlement so we can:
--   - Route "Manage subscription" actions to the right place (Stripe Customer
--     Portal vs iOS Settings > Subscriptions vs Google Play > Subscriptions)
--   - Resolve duplicate-subscription edge cases in support
--   - Slice MRR analytics by acquisition channel
--
-- The webhook that grants premium is the source of truth: when stripe-webhook
-- fires, it sets provider='stripe'; when revenuecat-webhook fires, it sets
-- provider='revenuecat'. The RLS migration 011 already locks subscription_tier
-- to service_role only, so the same lock applies de facto to this new column
-- when we add the matching column to its USING / WITH CHECK clauses (which
-- we don't need to do — the policy already covers ALL columns by being a
-- generic UPDATE policy with subscription_tier-only WITH CHECK).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_provider TEXT
  CHECK (subscription_provider IS NULL OR subscription_provider IN ('stripe', 'revenuecat'));

COMMENT ON COLUMN profiles.subscription_provider IS
  'Channel that granted the current premium subscription. NULL for free users. Set by the webhook handler (stripe-webhook or revenuecat-webhook). Used to route "manage subscription" actions back to the right billing surface.';
