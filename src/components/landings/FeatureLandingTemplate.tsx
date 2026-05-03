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
  useDocumentHead({ title: meta.title, description: meta.description });

  return (
    <div className="flex flex-col">
      <FeatureHero {...hero} />
      <FeatureBenefitGrid sectionLabel={benefits.sectionLabel} benefits={benefits.items} />
      <FeatureCta {...finalCta} />
    </div>
  );
}
