import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import i18n from '../i18n/index.ts';
import { supabase } from '../lib/supabase.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

const tHookError = (key: string) => i18n.t(`hook_errors.${key}`, { ns: 'common' });

// Permanent account deletion. Calls the delete-account edge function which
// cancels any active Stripe subscription, then auth.admin.deleteUser. After
// success we sign the user out locally so the UI flips back to the public
// surface — the auth row is already gone server-side.
export function useDeleteAccount() {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    if (!supabase) return tHookError('service_unavailable');
    setPending(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) {
        // supabase.functions.invoke surfaces non-2xx HTTP responses through
        // `error` (FunctionsHttpError), not `data` — so checking `data.ok`
        // here would be dead code.
        return await extractEdgeFunctionError(error as unknown as Record<string, unknown>, tHookError('generic_retry'));
      }
      await signOut();
      return null;
    } finally {
      setPending(false);
    }
  }, [signOut]);

  return { deleteAccount, pending };
}
