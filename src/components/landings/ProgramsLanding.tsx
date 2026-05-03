import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FeatureLandingTemplate } from './FeatureLandingTemplate.tsx';

function SparkIcon() {
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
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

function MoonIcon() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SlidersIcon() {
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
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function PackageIcon() {
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
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function ProgramsLanding() {
  const { t } = useTranslation('landing_programs');
  const { user } = useAuth();

  const primaryTarget = user ? '/programme/creer' : '/signup';

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
          { icon: <SparkIcon />, title: t('benefits.ai_title'), body: t('benefits.ai_body') },
          { icon: <MoonIcon />, title: t('benefits.deload_title'), body: t('benefits.deload_body') },
          { icon: <SlidersIcon />, title: t('benefits.personal_title'), body: t('benefits.personal_body') },
          { icon: <PackageIcon />, title: t('benefits.fixed_title'), body: t('benefits.fixed_body') },
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
