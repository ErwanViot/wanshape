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
      <Link to="/login" className="text-sm font-medium text-muted hover:text-strong transition-colors whitespace-nowrap">
        Se connecter / S'inscrire
      </Link>
    );
  }

  const displayName = profile?.display_name ?? user.user_metadata?.display_name;
  const firstName = displayName?.split(' ')[0];
  const initials = getInitials(displayName, user.email);

  return (
    <Link
      to="/parametres"
      className="flex items-center gap-2"
      aria-label="Paramètres"
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold bg-brand shrink-0">
          {initials}
        </div>
      )}
      {firstName && (
        <span className="hidden md:block text-sm font-medium text-heading">{firstName}</span>
      )}
    </Link>
  );
}
