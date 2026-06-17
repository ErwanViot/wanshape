import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseStorage } from './supabase-storage.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars missing — auth features disabled');
}

// In-memory mutex that serializes auth operations without Navigator Locks.
// Navigator Locks get stuck when a tab/module is disposed without releasing
// the lock (HMR, crashes, dev reloads). This mutex avoids that while still
// properly serializing concurrent auth state reads/writes.
const locks = new Map<string, Promise<unknown>>();

async function inMemoryLock<T>(name: string, _acquireTimeout: number, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();
  let resolve!: () => void;
  const next = new Promise<void>((r) => {
    resolve = r;
  });
  locks.set(name, next);

  await prev;
  try {
    return await fn();
  } finally {
    resolve();
    if (locks.get(name) === next) {
      locks.delete(name);
    }
  }
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
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      lock: inMemoryLock,
      storage: getSupabaseStorage(),
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
