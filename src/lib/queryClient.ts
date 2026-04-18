import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient for the whole app.
 *
 * Tuned for the Wan2Fit data model (mostly read-heavy, data changes slowly —
 * program sessions, meal logs of the day, nutrition profile). Defaults
 * rationale:
 * - `staleTime: 60s` — most queries (profile, program, nutrition target) can
 *   serve a minute-old cache without any user-visible regression. Dramatically
 *   cuts the refetch volume compared to the pre-migration "refetch on every
 *   navigation" pattern.
 *
 *   **MUTATION CONTRACT**: post-mutation freshness is the caller's
 *   responsibility. `staleTime` only governs background refetches — data
 *   written by the current session is NOT refetched unless you call
 *   `queryClient.invalidateQueries({ queryKey: [...] })` after the mutation.
 *   Every mutation helper must invalidate the query keys it affects.
 *
 * - `gcTime: 30min` — keep data in memory across route changes so a
 *   back/forward doesn't re-hit the network. 30 min is long enough for a
 *   typical single-session workflow, short enough to not hold stale user data
 *   indefinitely.
 * - `retry: 1` — Supabase queries that fail are usually either authz (no
 *   point retrying) or a transient network blip (one retry catches it).
 * - `refetchOnWindowFocus: false` — fixes the `inMemoryLock` deadlock that
 *   used to bite at every tab switch: the prior `AuthContext` visibility
 *   handler called `refreshSession()` while hooks refetched in parallel,
 *   racing on GoTrueClient's non-reentrant mutex. Now the visibility handler
 *   runs a single `invalidateQueries()` call after the 5-minute staleness
 *   threshold (see `AuthContext`). No per-hook race.
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
