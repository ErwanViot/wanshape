import { useState } from 'react';

interface Props {
  onAccept: () => void;
  onCancel?: () => void;
}

export function HealthDisclaimer({ onAccept, onCancel }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-dismiss is a standard modal pattern
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && onCancel) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onCancel) onCancel();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 pb-0">
          <div className="text-3xl mb-3">⚕️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Avertissement santé</h2>
          <p className="text-sm text-gray-400 mb-4">Avant de commencer, merci de lire attentivement.</p>
        </div>

        <div className="px-6 overflow-y-auto flex-1 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            WAN SHAPE propose du <strong>contenu éditorial et informationnel</strong> relatif à l'activité physique. Il
            ne s'agit pas de coaching sportif personnalisé ni d'encadrement par un éducateur sportif diplômé.
          </p>
          <p>
            Les séances sont des suggestions d'exercices à caractère général. Vous êtes seul responsable de leur
            exécution et de leur adaptation à votre condition physique.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-amber-800">Avant de pratiquer :</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Consultez un médecin pour vérifier votre aptitude sportive</li>
              <li>Ne pratiquez pas en cas de contre-indication médicale</li>
              <li>Arrêtez immédiatement en cas de douleur ou de malaise</li>
            </ul>
          </div>
          <p className="text-gray-400 text-xs">
            Service déconseillé sans avis médical pour les personnes présentant des pathologies cardiaques, des troubles
            articulaires, un état de grossesse ou toute condition pouvant être aggravée par l'exercice. Mineurs : accord
            parental requis.
          </p>
        </div>

        <div className="p-6 space-y-4">
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
