import { useTranslation } from 'react-i18next';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { PricingCards } from './PricingCards.tsx';

export function PricingPage() {
  const { t } = useTranslation('marketing');

  useDocumentHead({
    title: t('pricing.page_title'),
    description: t('pricing.page_description'),
  });

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-black text-heading mb-3">{t('pricing.heading')}</h1>
        <p className="text-muted max-w-lg mx-auto">{t('pricing.subtitle')}</p>
      </div>

      <PricingCards />
    </div>
  );
}
