import { Link } from 'react-router';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { getInitials } from '../../utils/getInitials.ts';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Clair', Icon: Sun },
  { value: 'dark' as const, label: 'Sombre', Icon: Moon },
  { value: 'system' as const, label: 'Système', Icon: Monitor },
];

export function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const { preference, setTheme } = useTheme();

  useDocumentHead({
    title: 'Paramètres',
    description: 'Gérez votre compte WanShape.',
  });

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name;
  const initials = getInitials(displayName, user?.email);

  return (
    <div className="px-6 py-8 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 bg-brand"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {displayName && <h1 className="text-xl font-bold text-heading truncate">{displayName}</h1>}
            <p className="text-sm text-muted truncate">{user?.email}</p>
            <p className="text-xs text-faint mt-0.5">
              Membre depuis {user?.created_at ? formatDate(user.created_at) : '—'}
            </p>
          </div>
        </div>

        {/* Theme */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Apparence</h2>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-colors cursor-pointer ${
                  preference === value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-divider text-muted hover:border-divider-strong'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Legal */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Informations</h2>
          <div className="space-y-1">
            <Link to="/legal/cgu" className="block py-2.5 text-sm text-body hover:text-heading transition-colors">
              Conditions d'utilisation
            </Link>
            <Link to="/legal/privacy" className="block py-2.5 text-sm text-body hover:text-heading transition-colors">
              Politique de confidentialité
            </Link>
          </div>
        </section>

        {/* Sign out */}
        <button
          type="button"
          onClick={signOut}
          className="w-full py-3 rounded-xl text-red-400 font-semibold border border-red-400/30 hover:bg-red-400/10 transition-colors cursor-pointer"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
