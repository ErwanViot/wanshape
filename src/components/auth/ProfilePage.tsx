import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useHistory } from '../../hooks/useHistory.ts';
import { usePrograms } from '../../hooks/useProgram.ts';
import { getInitials } from '../../utils/getInitials.ts';

const DAY_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { streak, totalSessions, totalDuration, weekDots, completions, loading: historyLoading } = useHistory(user?.id);
  const { programs } = usePrograms();

  useDocumentHead({
    title: 'Mon profil',
    description: 'Gérez votre compte WanShape.',
  });

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name;
  const initials = getInitials(displayName, user?.email);
  const totalMinutes = Math.round(totalDuration / 60);

  // Recent completions (last 5)
  const recentCompletions = completions.slice(0, 5);

  return (
    <main className="px-6 py-12 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-heading">Mon profil</h1>

        {/* Identity card */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
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
              <p className="text-xs text-faint mt-0.5">
                Membre depuis {user?.created_at ? formatDate(user.created_at) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats card */}
        {!historyLoading && totalSessions > 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Activité</h2>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-heading">{streak}</div>
                <div className="text-[11px] text-muted">{streak <= 1 ? 'jour' : 'jours de suite'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">{totalSessions}</div>
                <div className="text-[11px] text-muted">{totalSessions <= 1 ? 'séance' : 'séances'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-heading">{totalMinutes}</div>
                <div className="text-[11px] text-muted">min totales</div>
              </div>
            </div>

            {/* Week dots */}
            <div className="flex justify-center gap-3">
              {weekDots.map((done, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full border-2 transition-colors ${
                      done ? 'bg-emerald-500 border-emerald-400' : 'bg-transparent border-divider'
                    }`}
                  />
                  <span className="text-[9px] text-muted">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Welcome message if no sessions yet */}
        {!historyLoading && totalSessions === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-sm text-subtle">
              Lancez votre première séance pour commencer à suivre votre progression !
            </p>
          </div>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Programmes</h2>
              <Link to="/programmes" className="text-xs text-link hover:text-link-hover transition-colors">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {programs.map((p) => (
                <Link key={p.id} to={`/programme/${p.slug}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0">
                    {p.duration_weeks}s
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate group-hover:text-brand transition-colors">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-muted">
                      {p.frequency_per_week}x/sem · {p.duration_weeks} semaines
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recentCompletions.length > 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Dernières séances</h2>
            <div className="space-y-3">
              {recentCompletions.map((c) => {
                const minutes = c.duration_seconds ? Math.round(c.duration_seconds / 60) : null;
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-body truncate">
                        {c.session_date ? `Séance du ${c.session_date}` : 'Séance programme'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                      {minutes && <span>{minutes} min</span>}
                      <span>{formatShortDate(c.completed_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          type="button"
          onClick={signOut}
          className="w-full py-3 rounded-xl text-red-400 font-semibold border border-red-400/30 hover:bg-red-400/10 transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </main>
  );
}
