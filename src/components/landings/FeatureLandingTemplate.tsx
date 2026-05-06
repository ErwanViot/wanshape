import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { type FeatureBenefit, FeatureBenefitGrid } from './FeatureBenefitGrid.tsx';
import { FeatureCta } from './FeatureCta.tsx';
import { FeatureHero, type FeatureHeroCta } from './FeatureHero.tsx';

export interface FeatureLandingTemplateProps {
  meta: { title: string; description: string };
  hero: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    ctas: FeatureHeroCta[];
    visual?: React.ReactNode;
  };
  benefits: { sectionLabel: string; items: FeatureBenefit[] };
  finalCta: { title: string; subtitle?: string; ctas: FeatureHeroCta[] };
}

export function FeatureLandingTemplate({ meta, hero, benefits, finalCta }: FeatureLandingTemplateProps) {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  // Force EN when the URL is the EN-mirror so a crawler-friendly landing
  // always renders English content. We deliberately do NOT force FR on the
  // canonical FR path — that would override a deliberate language switch
  // by the user (LocaleToggle navigates to the twin URL when one exists,
  // but on URLs without a mirror the user's choice must win).
  useEffect(() => {
    if (pathname.startsWith('/en/') && i18n.language !== 'en') {
      void i18n.changeLanguage('en');
    }
  }, [pathname, i18n]);

  useDocumentHead({ title: meta.title, description: meta.description });

  return (
    <div className="flex flex-col">
      <FeatureHero {...hero} />
      <FeatureBenefitGrid sectionLabel={benefits.sectionLabel} benefits={benefits.items} />
      <FeatureCta {...finalCta} />
    </div>
  );
}
