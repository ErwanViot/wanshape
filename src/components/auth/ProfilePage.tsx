import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';

function getInitials(name: string | null | undefined, email: string | undefined): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ProfilePage() {
  const { user, profile, signOut } = useAuth();

  useDocumentHead({
    title: 'Mon profil — WAN SHAPE',
    description: 'Gérez votre compte WanShape.',
  });

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name;
  const initials = getInitials(displayName, user?.email);

  return (
    <main className="px-6 py-12 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-strong transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </Link>

        <h1 className="text-2xl font-bold text-heading mb-8">Mon profil</h1>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 cta-gradient"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              {displayName && <p className="text-lg font-semibold text-heading truncate">{displayName}</p>}
              <p className="text-sm text-muted truncate">{user?.email}</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="border-t border-divider pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Inscription</span>
              <span className="text-strong">{user?.created_at ? formatDate(user.created_at) : '—'}</span>
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={signOut}
            className="w-full py-3 rounded-xl text-red-400 font-semibold border border-red-400/30 hover:bg-red-400/10 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}
