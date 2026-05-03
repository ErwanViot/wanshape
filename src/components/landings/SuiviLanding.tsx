import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FeatureLandingTemplate } from './FeatureLandingTemplate.tsx';

function NetworkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="19" r="3" />
      <circle cx="19" cy="19" r="3" />
      <path d="M12 8v6M5.5 17l5-5M18.5 17l-5-5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.3 8.7l-12.6 12.6a1 1 0 0 1-1.4 0L2.7 16.7a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z" />
      <path d="M7 17l-2-2M11 13l-2-2M15 9l-2-2" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function SuiviLanding() {
  const { t } = useTranslation('landing_suivi');
  const { user } = useAuth();

  const primaryTarget = user ? '/suivi' : '/signup';

  return (
    <FeatureLandingTemplate
      meta={{ title: t('meta.title'), description: t('meta.description') }}
      hero={{
        eyebrow: t('hero.eyebrow'),
        title: t('hero.title'),
        subtitle: t('hero.subtitle'),
        ctas: [
          { label: t('hero.cta_primary'), to: primaryTarget },
          { label: t('hero.cta_secondary'), to: '/programmes', variant: 'secondary' },
        ],
      }}
      benefits={{
        sectionLabel: t('benefits.section_label'),
        items: [
          {
            icon: <NetworkIcon />,
            title: t('benefits.correlation_title'),
            body: t('benefits.correlation_body'),
          },
          { icon: <CalendarIcon />, title: t('benefits.history_title'), body: t('benefits.history_body') },
          { icon: <RulerIcon />, title: t('benefits.body_title'), body: t('benefits.body_body') },
          { icon: <TrendIcon />, title: t('benefits.signal_title'), body: t('benefits.signal_body') },
        ],
      }}
      finalCta={{
        title: t('final_cta.title'),
        subtitle: t('final_cta.subtitle'),
        ctas: [
          { label: t('final_cta.cta_primary'), to: primaryTarget },
          { label: t('final_cta.cta_secondary'), to: '/programmes', variant: 'secondary' },
        ],
      }}
    />
  );
}
