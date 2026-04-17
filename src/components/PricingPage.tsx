import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { PricingCards } from './PricingCards.tsx';

export function PricingPage() {
  useDocumentHead({
    title: 'Tarifs',
    description: "Découvrez les offres Wan2Fit : gratuit pour commencer, Premium pour aller plus loin avec l'IA.",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-black text-heading mb-3">Choisis ton plan</h1>
        <p className="text-muted max-w-lg mx-auto">
          Gratuit pour commencer, Premium pour aller plus loin avec des séances et programmes générés par IA.
        </p>
      </div>

      <PricingCards />
    </div>
  );
}
