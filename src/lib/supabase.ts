import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars missing — auth features disabled');
}

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;

  // In development, Vite HMR can orphan the previous Supabase client while it still
  // holds a Navigator Lock on the auth token, causing a 10s timeout on every reload.
  // Reuse the existing client across HMR updates to prevent this.
  if (import.meta.hot?.data.supabase) {
    return import.meta.hot.data.supabase as SupabaseClient;
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Replace Navigator Lock with a simple no-contention lock.
      // Navigator Locks coordinate across tabs but get stuck when a tab/module
      // is disposed without releasing the lock (HMR, crashes, dev reloads).
      // A simple passthrough is safe for a single-tab PWA.
      lock: async (_name, _acquireTimeout, fn) => fn(),
    },
  });

  return client;
}

const client = getClient();

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.supabase = client;
  });
}

export const supabase = client;
