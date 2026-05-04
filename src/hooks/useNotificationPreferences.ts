import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';

export interface NotificationPreferences {
  info: boolean;
  progression: boolean;
  new_content: boolean;
}

const DEFAULTS: NotificationPreferences = {
  info: true,
  progression: false,
  new_content: false,
};

// Read + update opt-in flags. The migration trigger seeds a row at signup
// so we always have defaults to read; the upsert is defensive in case the
// row is ever missing.
export function useNotificationPreferences() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences', userId ?? null],
    queryFn: async () => {
      if (!supabase || !userId) return DEFAULTS;
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!
          .from('notification_preferences')
          .select('info, progression, new_content')
          .eq('user_id', userId)
          .maybeSingle(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return DEFAULTS;
      }
      return (data as NotificationPreferences | null) ?? DEFAULTS;
    },
    enabled: !!userId && !!supabase,
  });

  const mutation = useMutation({
    mutationFn: async (patch: Partial<NotificationPreferences>) => {
      if (!supabase || !userId) throw new Error('Not signed in');
      const next = { ...DEFAULTS, ...query.data, ...patch };
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: userId, ...next, updated_at: new Date().toISOString() });
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(['notification-preferences', userId ?? null], next);
    },
  });

  return {
    preferences: query.data ?? DEFAULTS,
    loading: query.isPending,
    setPreference: (key: keyof NotificationPreferences, value: boolean) => mutation.mutateAsync({ [key]: value }),
    isPending: mutation.isPending,
  };
}
