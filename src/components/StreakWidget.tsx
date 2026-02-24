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
            Lancez votre première séance pour commencer à suivre votre progression !
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
              <div className="text-xs text-muted">
                {streak <= 1 ? 'jour' : 'jours consécutifs'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5">
            <div className="text-center">
              <div className="text-lg font-bold text-heading">{totalSessions}</div>
              <div className="text-[11px] text-muted">séances</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-heading">{totalMinutes}</div>
              <div className="text-[11px] text-muted">min totales</div>
            </div>
          </div>

          {/* Week dots */}
          <div className="flex gap-2">
            {weekDots.map((done, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full border-2 transition-colors ${
                    done
                      ? 'bg-emerald-500 border-emerald-400'
                      : 'bg-transparent border-divider'
                  }`}
                />
                <span className="text-[9px] text-muted">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
