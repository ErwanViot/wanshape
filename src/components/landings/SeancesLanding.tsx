import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FeatureLandingTemplate } from './FeatureLandingTemplate.tsx';

function ZapIcon() {
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function HomeIcon() {
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GridIcon() {
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ClockIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function SeancesLanding() {
  const { t } = useTranslation('landing_sessions');
  const { user } = useAuth();

  const primaryTarget = user ? '/seances' : '/signup';
  const primaryLabel = t('hero.cta_primary');
  const formatsLabel = t('hero.cta_secondary');

  return (
    <FeatureLandingTemplate
      meta={{ title: t('meta.title'), description: t('meta.description') }}
      hero={{
        eyebrow: t('hero.eyebrow'),
        title: t('hero.title'),
        subtitle: t('hero.subtitle'),
        ctas: [
          { label: primaryLabel, to: primaryTarget },
          { label: formatsLabel, to: '/formats', variant: 'secondary' },
        ],
      }}
      benefits={{
        sectionLabel: t('benefits.section_label'),
        items: [
          { icon: <ZapIcon />, title: t('benefits.no_decision_title'), body: t('benefits.no_decision_body') },
          { icon: <HomeIcon />, title: t('benefits.no_gear_title'), body: t('benefits.no_gear_body') },
          { icon: <GridIcon />, title: t('benefits.formats_title'), body: t('benefits.formats_body') },
          { icon: <ClockIcon />, title: t('benefits.duration_title'), body: t('benefits.duration_body') },
        ],
      }}
      finalCta={{
        title: t('final_cta.title'),
        subtitle: t('final_cta.subtitle'),
        ctas: [
          { label: primaryLabel, to: primaryTarget },
          { label: t('final_cta.cta_secondary'), to: '/formats', variant: 'secondary' },
        ],
      }}
    />
  );
}
