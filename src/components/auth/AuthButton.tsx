import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { supabase } from '../../lib/supabase.ts';
import { getInitials } from '../../utils/getInitials.ts';

export function AuthButton() {
  const { user, profile, loading } = useAuth();

  // No Supabase or still loading → render nothing
  if (!supabase || loading) return null;

  if (!user) {
    return (
      <Link to="/login" className="text-sm font-medium text-muted hover:text-strong transition-colors">
        Connexion
      </Link>
    );
  }

  const displayName = profile?.display_name ?? user.user_metadata?.display_name;
  const initials = getInitials(displayName, user.email);

  return (
    <Link
      to="/profil"
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold bg-brand shrink-0"
      aria-label="Mon profil"
    >
      {initials}
    </Link>
  );
}
