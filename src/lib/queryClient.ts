import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient for the whole app.
 *
 * Tuned for the Wan2Fit data model (mostly read-heavy, data changes slowly —
 * program sessions, meal logs of the day, nutrition profile) and with a
 * specific goal: replace the hand-rolled visibility-refresh dance in
 * `AuthContext` + the `bumpDataGeneration()` global invalidation in
 * `PublicLayout`, both of which are tied to the `inMemoryLock` deadlock
 * documented in `tech-debt.md`.
 *
 * Defaults rationale:
 * - `staleTime: 60s` — most queries (profile, program, nutrition target) can
 *   serve a minute-old cache without any user-visible regression. Dramatically
 *   cuts the refetch volume compared to the current "refetch on every
 *   navigation" pattern.
 * - `gcTime: 30min` — keep data in memory across route changes so a
 *   back/forward doesn't re-hit the network. 30 min is long enough for a
 *   typical single-session workflow, short enough to not hold stale user data
 *   indefinitely.
 * - `retry: 1` — Supabase queries that fail are usually either authz (no
 *   point retrying) or a transient network blip (one retry catches it).
 * - `refetchOnWindowFocus: false` — **this is the deadlock fix**. Refocus
 *   used to trigger `refreshSession()` + every hook re-fetching, racing on
 *   the GoTrueClient `inMemoryLock`. With TanStack we let stale data show
 *   immediately and let a background `refetchOnMount` handle updates where
 *   truly needed.
 * - `refetchOnReconnect: true` — legitimate: if the user was offline, the
 *   cache is probably stale.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
