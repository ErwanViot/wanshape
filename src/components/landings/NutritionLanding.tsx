import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FeatureLandingTemplate } from './FeatureLandingTemplate.tsx';
import { NutritionPreviewMockup } from './NutritionPreviewMockup.tsx';

function PieIcon() {
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
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function BarcodeIcon() {
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
      <path d="M3 5v14M7 5v14M11 5v9M15 5v14M19 5v14" />
    </svg>
  );
}

function HistoryIcon() {
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
      <path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.4 2.4L3 8" />
      <polyline points="3 3 3 8 8 8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SparkleIcon() {
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
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 17l.6 1.5L21 19l-1.4.5L19 21l-.6-1.5L17 19l1.4-.5z" />
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
        visual: <NutritionPreviewMockup />,
      }}
      benefits={{
        sectionLabel: t('benefits.section_label'),
        items: [
          { icon: <PieIcon />, title: t('benefits.kcal_title'), body: t('benefits.kcal_body') },
          { icon: <BarcodeIcon />, title: t('benefits.search_title'), body: t('benefits.search_body') },
          { icon: <HistoryIcon />, title: t('benefits.history_title'), body: t('benefits.history_body') },
          { icon: <SparkleIcon />, title: t('benefits.insight_title'), body: t('benefits.insight_body') },
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
