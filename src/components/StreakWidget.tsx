import { useAuth } from '../contexts/AuthContext.tsx';
import { useHistory } from '../hooks/useHistory.ts';

const DAY_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export function StreakWidget() {
  const { user } = useAuth();
  const { streak, totalSessions, totalDuration, weekDots, loading } = useHistory(user?.id);

  if (!user || loading) return null;

  const totalMinutes = Math.round(totalDuration / 60);

  if (totalSessions === 0) {
    return (
      <div className="px-6 md:px-10 lg:px-14 mb-6">
        <div className="glass-card rounded-[20px] p-5 md:p-6">
          <p className="text-sm text-subtle text-center">
            Votre première séance vous attend — commencez aujourd'hui et suivez vos progrès ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 lg:px-14 mb-6">
      <div className="glass-card rounded-[20px] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Streak */}
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="Flamme">
              🔥
            </span>
            <div>
              <div className="text-2xl font-bold text-heading leading-none">{streak}</div>
              <div className="text-xs text-muted">{streak <= 1 ? 'jour' : 'jours de suite'}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5">
            <div className="text-center">
              <div className="text-lg font-bold text-heading">{totalSessions}</div>
              <div className="text-xs text-muted">séances</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-heading">{totalMinutes}</div>
              <div className="text-xs text-muted">min totales</div>
            </div>
          </div>

          {/* Week dots */}
          <fieldset className="flex gap-2 border-0 p-0 m-0" aria-label="Activité de la semaine">
            {weekDots.map((done, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  role="img"
                  className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center ${
                    done ? 'bg-emerald-500 border-emerald-400' : 'bg-transparent border-divider'
                  }`}
                  aria-label={`${DAY_LABELS[i]} : ${done ? 'complété' : 'non complété'}`}
                >
                  {done && (
                    <svg
                      width="12"
                      height="12"
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
      </div>
    </div>
  );
}
