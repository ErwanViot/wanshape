import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FeatureLandingTemplate } from './FeatureLandingTemplate.tsx';

function LinkIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function BookIcon() {
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function FeatherIcon() {
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
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

function GlobeIcon() {
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
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function NutritionLanding() {
  const { t } = useTranslation('landing_nutrition');
  const { user } = useAuth();

  const primaryTarget = user ? '/nutrition' : '/signup';

  return (
    <FeatureLandingTemplate
      meta={{ title: t('meta.title'), description: t('meta.description') }}
      hero={{
        eyebrow: t('hero.eyebrow'),
        title: t('hero.title'),
        subtitle: t('hero.subtitle'),
        ctas: [
          { label: t('hero.cta_primary'), to: primaryTarget },
          { label: t('hero.cta_secondary'), to: '/nutrition/recettes', variant: 'secondary' },
        ],
      }}
      benefits={{
        sectionLabel: t('benefits.section_label'),
        items: [
          { icon: <LinkIcon />, title: t('benefits.context_title'), body: t('benefits.context_body') },
          { icon: <BookIcon />, title: t('benefits.recipes_title'), body: t('benefits.recipes_body') },
          { icon: <FeatherIcon />, title: t('benefits.simple_title'), body: t('benefits.simple_body') },
          { icon: <GlobeIcon />, title: t('benefits.bilingual_title'), body: t('benefits.bilingual_body') },
        ],
      }}
      finalCta={{
        title: t('final_cta.title'),
        subtitle: t('final_cta.subtitle'),
        ctas: [
          { label: t('final_cta.cta_primary'), to: primaryTarget },
          { label: t('final_cta.cta_secondary'), to: '/nutrition/recettes', variant: 'secondary' },
        ],
      }}
    />
  );
}
