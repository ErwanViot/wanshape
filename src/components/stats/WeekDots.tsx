const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function WeekDots({ weekDots }: { weekDots: boolean[] }) {
  const activeDays = weekDots.filter(Boolean).length;

  return (
    <div aria-label={`Activité de la semaine : ${activeDays} jour${activeDays > 1 ? 's' : ''} sur 7`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">Cette semaine</p>
        <p className="text-xs text-muted">{activeDays} jour{activeDays > 1 ? 's' : ''} d'activité</p>
      </div>
      <div className="flex gap-2">
        {weekDots.map((done, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={`w-full aspect-square max-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                done
                  ? 'bg-emerald-500/20 border-2 border-emerald-500'
                  : 'bg-surface-2 border-2 border-divider-strong'
              }`}
            >
              {done && (
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-[11px] font-medium text-muted">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
