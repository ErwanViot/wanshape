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
    description: 'Votre parcours fitness sur WanShape.',
  });

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name;
  const initials = getInitials(displayName, user?.email);
  const totalMinutes = Math.round(totalDuration / 60);
  const recentCompletions = completions.slice(0, 5);

  return (
    <div className="px-6 py-8 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Identity section — no card, clean and prominent */}
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

        {/* Stats section — inline, no card wrapper */}
        {!historyLoading && totalSessions > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="glass-card rounded-xl p-3">
                <div className="text-2xl font-bold text-heading">{streak}</div>
                <div className="text-xs text-muted">{streak <= 1 ? 'jour' : 'jours de suite'}</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <div className="text-2xl font-bold text-heading">{totalSessions}</div>
                <div className="text-xs text-muted">{totalSessions <= 1 ? 'séance' : 'séances'}</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <div className="text-2xl font-bold text-heading">{totalMinutes}</div>
                <div className="text-xs text-muted">min totales</div>
              </div>
            </div>

            {/* Week dots */}
            <fieldset className="flex justify-center gap-3 border-0 p-0 m-0" aria-label="Activité de la semaine">
              {weekDots.map((done, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    role="img"
                    className={`w-7 h-7 rounded-full border-2 transition-colors flex items-center justify-center ${
                      done ? 'bg-emerald-500 border-emerald-400' : 'bg-transparent border-divider'
                    }`}
                    aria-label={`${DAY_LABELS[i]} : ${done ? 'complété' : 'non complété'}`}
                  >
                    {done && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] text-muted">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </fieldset>
          </div>
        )}

        {/* Welcome message if no sessions yet */}
        {!historyLoading && totalSessions === 0 && (
          <div className="rounded-xl border border-dashed border-divider-strong p-6 text-center">
            <p className="text-sm text-subtle">
              Votre première séance vous attend — lancez-la et vos progrès s'afficheront ici.
            </p>
            <Link to="/" className="inline-block mt-3 text-sm text-link hover:text-link-hover transition-colors">
              Voir la séance du jour
            </Link>
          </div>
        )}

        {/* Programs — lightweight list */}
        {programs.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Programmes</h2>
              <Link to="/programmes" className="text-xs text-link hover:text-link-hover transition-colors">
                Voir tout
              </Link>
            </div>
            <div className="space-y-2">
              {programs.map((p) => (
                <Link
                  key={p.id}
                  to={`/programme/${p.slug}`}
                  className="flex items-center gap-3 glass-card rounded-xl p-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0">
                    {p.duration_weeks}s
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate group-hover:text-brand transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted">
                      {p.frequency_per_week}x/sem · {p.duration_weeks} semaines
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent activity — simple list, no heavy card */}
        {recentCompletions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Dernières séances</h2>
            <div className="space-y-2">
              {recentCompletions.map((c) => {
                const minutes = c.duration_seconds ? Math.round(c.duration_seconds / 60) : null;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-divider last:border-0"
                  >
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
          </section>
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
    </div>
  );
}
