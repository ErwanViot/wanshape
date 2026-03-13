-- CRITICAL FIX: Restrict profile UPDATE to safe columns only.
-- Without this, any authenticated user can set subscription_tier = 'premium'
-- via a direct Supabase client call, bypassing payment entirely.

-- Drop the permissive "update own" policy
DROP POLICY IF EXISTS "update own" ON public.profiles;

-- Recreate with column restriction: users can only update display_name and avatar_url.
-- subscription_tier is managed exclusively by the stripe-webhook edge function
-- via the service-role key (which bypasses RLS).
CREATE POLICY "update own safe columns" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND subscription_tier = (SELECT p.subscription_tier FROM public.profiles p WHERE p.id = auth.uid())
  );
