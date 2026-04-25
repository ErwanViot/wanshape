import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { isSupportedLocale } from '../i18n';
import { supabase } from '../lib/supabase.ts';
import type { Session } from '../types/session.ts';

/**
 * Fetch the daily session for `dateKey` from Supabase.
 *
 * Tries the user's locale first, then falls back to `'fr'` if no row exists
 * for that locale (e.g. session was generated before bilingual content
 * landed, or the EN translation hasn't been written yet).
 *
 * RLS allows anonymous SELECT — no auth required.
 */
async function fetchDailySession(dateKey: string, locale: string): Promise<Session> {
  if (!supabase) throw new Error('supabase_unavailable');
  const client = supabase;

  const tryLocale = async (lng: string) => {
    const { data, error } = await client
      .from('daily_sessions')
      .select('session_data')
      .eq('date_key', dateKey)
      .eq('locale', lng)
      .maybeSingle();
    if (error) throw error;
    return data?.session_data as Session | undefined;
  };

  const requested = await tryLocale(locale);
  if (requested) return requested;

  // TODO(PR-5b): once EN rows are seeded, replace this two-roundtrip flow with
  // a single .in('locale', [locale, 'fr']) query and pick the preferred row
  // client-side. Today the second hop is cheap because (date_key, locale) PK
  // makes both lookups index-only.
  if (locale !== 'fr') {
    const fr = await tryLocale('fr');
    if (fr) return fr;
  }

  throw new Error('not_found');
}

export function useSession(dateKey: string | null) {
  const { i18n } = useTranslation();
  const locale = isSupportedLocale(i18n.language) ? i18n.language : 'fr';

  const query = useQuery<Session>({
    queryKey: ['daily-session', dateKey, locale],
    queryFn: () => fetchDailySession(dateKey!, locale),
    enabled: !!dateKey && !!supabase,
    staleTime: 5 * 60 * 1000, // 5 min — content changes rarely
  });

  return {
    session: query.data ?? null,
    // isPending stays true while the query is disabled (no supabase client yet),
    // which is the honest "still figuring it out" signal for the UI.
    loading: query.isPending,
    error: query.error ? (query.error.message === 'not_found' ? 'not_found' : 'error') : null,
  };
}
