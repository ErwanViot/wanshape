import { useEffect, useRef, useState } from 'react';
import { HeartPulse } from 'lucide-react';

interface Props {
  onAccept: () => void;
  onCancel?: () => void;
}

export function HealthDisclaimer({ onAccept, onCancel }: Props) {
  const [checked, setChecked] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap: focus the dialog on mount, trap Tab inside
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus the first focusable element
    const selector = 'button:not(:disabled), [href], input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])';
    const initialFocusable = dialog.querySelectorAll<HTMLElement>(selector);
    if (initialFocusable.length > 0) initialFocusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;

      // Re-query on each keydown to account for disabled state changes
      const focusable = dialog!.querySelectorAll<HTMLElement>(selector);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-20 sm:pb-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-disclaimer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && onCancel) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-full flex flex-col"
      >
        <div className="p-6 pb-0 shrink-0">
          <HeartPulse className="w-8 h-8 text-brand mb-3" aria-hidden="true" />
          <h2 id="health-disclaimer-title" className="text-xl font-bold text-gray-900 mb-1">
            Avertissement santé
          </h2>
          <p className="text-sm text-gray-400 mb-4">Avant de commencer, merci de lire attentivement.</p>
        </div>

        <div className="px-6 overflow-y-auto flex-1 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            Wan2Fit propose du <strong>contenu éditorial et informationnel</strong> relatif à l'activité physique. Il
            ne s'agit pas de coaching sportif personnalisé ni d'encadrement par un éducateur sportif diplômé.
          </p>
          <p>
            Les séances sont des suggestions d'exercices à caractère général. Tu es seul responsable de leur
            exécution et de leur adaptation à ta condition physique.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-amber-800">Avant de pratiquer :</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Consulte un médecin pour vérifier ton aptitude sportive</li>
              <li>Ne pratique pas en cas de contre-indication médicale</li>
              <li>Arrête immédiatement en cas de douleur ou de malaise</li>
            </ul>
          </div>
          <p className="text-gray-400 text-xs">
            Service déconseillé sans avis médical pour les personnes présentant des pathologies cardiaques, des troubles
            articulaires, un état de grossesse ou toute condition pouvant être aggravée par l'exercice. Réservé aux
            personnes majeures (18 ans et plus).
          </p>
        </div>

        <div className="p-6 pt-4 space-y-4 shrink-0">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <span className="text-sm text-gray-700 leading-snug">
              J'ai lu et compris cet avertissement. Je pratique sous ma propre responsabilité et déclare ne pas
              présenter de contre-indication médicale.
            </span>
          </label>

          <button
            type="button"
            onClick={onAccept}
            disabled={!checked}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              checked
                ? 'bg-gradient-to-r from-brand to-brand-secondary text-white shadow-lg shadow-brand/25 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
