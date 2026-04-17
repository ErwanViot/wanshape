import { useCallback } from 'react';
import { CURRENT_CGU_VERSION } from '../config/legal.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';

export interface UseCguStatusResult {
  /** True while auth is still resolving. The modal MUST wait before rendering. */
  loading: boolean;
  /** True when the user is authenticated and their recorded version is stale. */
  needsRevalidation: boolean;
  /** Persist the current version for the authenticated user. */
  acceptCurrentVersion: () => Promise<boolean>;
}

/**
 * Computes whether the currently authenticated user needs to re-validate the
 * CGU / Privacy Policy because the version constant bumped.
 *
 * Visitors (no user) are never prompted. New accounts created *after* the bump
 * get `cgu_version_accepted=NULL` by default; the modal prompts them on first
 * login so we always have a paper trail of the version they accepted.
 */
export function useCguStatus(): UseCguStatusResult {
  const { user, profile, loading, refreshProfile } = useAuth();

  const acceptCurrentVersion = useCallback(async () => {
    if (!user || !supabase) return false;
    const { error, sessionExpired } = await supabaseQuery(() =>
      supabase!
        .from('profiles')
        .update({ cgu_version_accepted: CURRENT_CGU_VERSION })
        .eq('id', user.id)
        .select()
        .single(),
    );
    if (sessionExpired) {
      notifySessionExpired();
      return false;
    }
    if (error) return false;
    await refreshProfile();
    return true;
  }, [user, refreshProfile]);

  const accepted = profile?.cgu_version_accepted ?? null;
  const needsRevalidation = !!user && !loading && accepted !== CURRENT_CGU_VERSION;

  return { loading, needsRevalidation, acceptCurrentVersion };
}
