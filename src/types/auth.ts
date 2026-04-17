import type { SubscriptionTier } from './subscription.ts';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  subscription_tier: SubscriptionTier;
  cgu_version_accepted: string | null;
  created_at: string;
  updated_at: string;
}
