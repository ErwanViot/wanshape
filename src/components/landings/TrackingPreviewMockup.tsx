import { useTranslation } from 'react-i18next';

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-surface border border-divider px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 font-display text-base font-bold text-heading leading-none">{value}</p>
      <p className="text-[10px] text-muted mt-1">{sub}</p>
    </div>
  );
}

const WEEK_PATTERN = [true, true, false, true, false, false, false] as const;
const BAR_HEIGHTS = [42, 70, 30, 88, 56, 78, 95] as const;

export function TrackingPreviewMockup() {
  const { t } = useTranslation('landing_suivi');
  return (
    <div
      role="img"
      aria-label={t('hero.visual_aria')}
      className="w-full max-w-[340px] rounded-2xl bg-card-bg border border-card-border p-5 shadow-2xl"
    >
      <header className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold text-heading">{t('hero.mockup_title')}</h3>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted">{t('hero.mockup_subtitle')}</span>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Metric label={t('hero.mockup_metric_total_label')} value="24" sub={t('hero.mockup_metric_total_sub')} />
        <Metric label={t('hero.mockup_metric_time_label')} value="8h12" sub={t('hero.mockup_metric_time_sub')} />
        <Metric label={t('hero.mockup_metric_avg_label')} value="32 min" sub={t('hero.mockup_metric_avg_sub')} />
        <Metric label={t('hero.mockup_metric_week_label')} value="3" sub={t('hero.mockup_metric_week_sub')} />
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">
          {t('hero.mockup_week_label')}
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEK_PATTERN.map((active, i) => (
            <div key={i} className={`h-2.5 rounded-full ${active ? 'bg-brand' : 'bg-divider'}`} />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">
          {t('hero.mockup_volume_label')}
        </p>
        <div className="flex items-end gap-1.5 h-12">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-t-md ${i === BAR_HEIGHTS.length - 1 ? 'bg-brand' : 'bg-brand/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
