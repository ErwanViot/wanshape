import { Link } from 'react-router';
import { Sparkles } from 'lucide-react';

export function UpgradePrompt({ className = '' }: { className?: string }) {
  return (
    <div className={`max-w-lg mx-auto px-6 py-12 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-8 h-8 text-accent" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-bold text-heading mb-2">
        Fonctionnalité Premium
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-6">
        Cette fonctionnalité est réservée aux abonnés Premium. Passe à Premium pour créer des séances et des programmes personnalisés par IA.
      </p>
      <Link
        to="/tarifs"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white cta-gradient"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        Découvrir Premium
      </Link>
    </div>
  );
}
