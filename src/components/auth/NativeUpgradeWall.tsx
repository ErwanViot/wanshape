import { Crown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { openWebPricingPage } from '../../lib/native-upgrade.ts';

interface NativeUpgradeWallProps {
  // Optional overrides — defaults cover the generic "Premium gating" case.
  title?: string;
  body?: string;
}

// Apple guideline 3.1.3(b) — Multiplatform Service.
//
// The iOS/Android shells must NOT show a price, a "Buy" button, or a CTA
// that leads to a price screen still inside the app. This component is the
// single place we render when a user tries to reach a paid feature on
// native: it explains the situation in neutral language and opens
// wan2fit.fr in SafariViewController (Capacitor Browser) when the user is
// ready to subscribe. The subscription itself happens entirely on the web.
export function NativeUpgradeWall({ title, body }: NativeUpgradeWallProps) {
  const { t } = useTranslation('common');
  const [opening, setOpening] = useState(false);

  const handleOpen = async () => {
    setOpening(true);
    try {
      await openWebPricingPage();
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10">
          <Crown className="w-8 h-8 text-brand" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-heading">
            {title ?? t('native_upgrade.title', { defaultValue: 'Cette fonctionnalité fait partie de Premium' })}
          </h2>
          <p className="text-sm text-subtle leading-relaxed">
            {body ??
              t('native_upgrade.body', {
                defaultValue:
                  "Gère ton abonnement sur wan2fit.fr depuis n'importe quel navigateur. Une fois ton compte Premium activé, toutes les fonctionnalités sont disponibles ici sans rien à refaire.",
              })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          disabled={opening}
          className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white w-full sm:w-auto disabled:opacity-60"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          {opening
            ? t('native_upgrade.opening', { defaultValue: 'Ouverture…' })
            : t('native_upgrade.cta', { defaultValue: 'Continuer sur wan2fit.fr' })}
        </button>

        <p className="text-xs text-faint leading-relaxed">
          {t('native_upgrade.legal_note', {
            defaultValue:
              "L'abonnement Premium est géré par WAN SOFT sur wan2fit.fr. Aucune souscription n'a lieu dans cette application.",
          })}
        </p>
      </div>
    </div>
  );
}
