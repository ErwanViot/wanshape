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

  // Sync i18n locale with URL prefix so EN-mirrored landing URLs always render
  // English content, even when navigated via SPA (no full reload).
  useEffect(() => {
    const targetLng = pathname.startsWith('/en/') ? 'en' : 'fr';
    if (i18n.language !== targetLng) {
      void i18n.changeLanguage(targetLng);
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
