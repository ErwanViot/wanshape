import { ChartLine, ChevronRight, Dumbbell, ListChecks, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

type Pillar = {
  icon: React.ReactNode;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  to: string;
  accent: 'brand' | 'brand-secondary' | 'accent' | 'amber';
};

const PILLARS: ReadonlyArray<Pillar> = [
  {
    icon: <Dumbbell className="w-6 h-6" aria-hidden="true" />,
    titleKey: 'visitor.pillars.sessions_title',
    bodyKey: 'visitor.pillars.sessions_body',
    ctaKey: 'visitor.pillars.sessions_cta',
    to: '/decouvrir/seances',
    accent: 'brand',
  },
  {
    icon: <ListChecks className="w-6 h-6" aria-hidden="true" />,
    titleKey: 'visitor.pillars.programs_title',
    bodyKey: 'visitor.pillars.programs_body',
    ctaKey: 'visitor.pillars.programs_cta',
    to: '/decouvrir/programmes',
    accent: 'brand-secondary',
  },
  {
    icon: <Utensils className="w-6 h-6" aria-hidden="true" />,
    titleKey: 'visitor.pillars.nutrition_title',
    bodyKey: 'visitor.pillars.nutrition_body',
    ctaKey: 'visitor.pillars.nutrition_cta',
    to: '/decouvrir/nutrition',
    accent: 'accent',
  },
  {
    icon: <ChartLine className="w-6 h-6" aria-hidden="true" />,
    titleKey: 'visitor.pillars.tracking_title',
    bodyKey: 'visitor.pillars.tracking_body',
    ctaKey: 'visitor.pillars.tracking_cta',
    to: '/decouvrir/suivi',
    accent: 'amber',
  },
] as const;

const ACCENT_CLASSES: Record<Pillar['accent'], { bg: string; text: string; hover: string }> = {
  brand: { bg: 'bg-brand/10', text: 'text-brand', hover: 'group-hover:text-brand' },
  'brand-secondary': {
    bg: 'bg-brand-secondary/10',
    text: 'text-brand-secondary',
    hover: 'group-hover:text-brand-secondary',
  },
  accent: { bg: 'bg-accent/10', text: 'text-accent', hover: 'group-hover:text-accent' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', hover: 'group-hover:text-amber-500' },
};

export function HomePillarsGrid() {
  const { t } = useTranslation('home');

  return (
    <section className="px-6 md:px-10 lg:px-14 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-black text-heading tracking-tight">
            {t('visitor.pillars.heading')}
          </h2>
          <p className="text-body mt-3 text-base md:text-lg">{t('visitor.pillars.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PILLARS.map((pillar) => {
            const accent = ACCENT_CLASSES[pillar.accent];
            return (
              <Link
                key={pillar.to}
                to={pillar.to}
                className="group rounded-2xl bg-card-bg border border-card-border p-6 md:p-7 flex flex-col gap-3 hover:border-divider-strong transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${accent.bg} ${accent.text} flex items-center justify-center`}>
                  {pillar.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-heading">{t(pillar.titleKey)}</h3>
                <p className="text-body text-sm leading-relaxed">{t(pillar.bodyKey)}</p>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold mt-1 ${accent.text} ${accent.hover}`}
                >
                  {t(pillar.ctaKey)}
                  <ChevronRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
