import { AlertTriangle } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CGU_VERSION_CHANGES, CURRENT_CGU_VERSION } from '../../config/legal.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useCguStatus } from '../../hooks/useCguStatus.ts';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Blocking modal shown at login when `profiles.cgu_version_accepted` does not
 * match `CURRENT_CGU_VERSION`. Mounted at the top of the app tree so it
 * prevents interactions with any page until the user either accepts the new
 * terms or signs out.
 *
 * Accessibility: role=dialog + aria-modal, Escape does NOT close (blocking),
 * focus trapped inside, body scroll not needed since it fills the viewport.
 */
export function CguRevalidationModal() {
  const { needsRevalidation, acceptCurrentVersion } = useCguStatus();
  const { signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!needsRevalidation) return;
    dialogRef.current?.focus();
  }, [needsRevalidation]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    // Keyboard focus trap: WCAG 2.1.2 requires no keyboard trap in general, but
    // for modal dialogs the WAI-ARIA practice is to confine focus inside the
    // dialog until dismissed. We cycle Tab / Shift+Tab between the first and
    // last focusable elements of the dialog.
    const root = dialogRef.current;
    if (!root) return;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.hasAttribute('disabled'),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      root.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey) {
      if (active === first || active === root) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  if (!needsRevalidation) return null;

  async function handleAccept() {
    setSubmitting(true);
    setError(null);
    const ok = await acceptCurrentVersion();
    if (!ok) {
      setError("Impossible d'enregistrer. Vérifie ta connexion et réessaie.");
    }
    setSubmitting(false);
  }

  async function handleSignOut() {
    setSubmitting(true);
    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cgu-revalidation-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg rounded-2xl bg-surface border border-card-border p-6 shadow-2xl space-y-5 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-brand" aria-hidden="true" />
          <h2 id="cgu-revalidation-title" className="font-display text-lg font-black text-heading">
            Mise à jour des conditions
          </h2>
        </div>

        <p className="text-sm text-body leading-relaxed">
          Nos <strong>Conditions Générales d'Utilisation</strong> et notre <strong>Politique de Confidentialité</strong>{' '}
          ont été mises à jour (version {CURRENT_CGU_VERSION}). L'accès à l'app est suspendu le temps que tu les
          acceptes.
        </p>

        <div className="rounded-xl bg-surface-card border border-divider p-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Principales évolutions</p>
          <ul className="space-y-1.5 text-sm text-body">
            {CGU_VERSION_CHANGES.map((change) => (
              <li key={change} className="flex gap-2">
                <span className="text-brand" aria-hidden="true">
                  •
                </span>
                <span className="flex-1">{change}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted">
          Consulte le détail dans les{' '}
          <Link to="/legal/cgu" className="text-link underline" target="_blank" rel="noopener noreferrer">
            CGU
          </Link>{' '}
          et la{' '}
          <Link to="/legal/privacy" className="text-link underline" target="_blank" rel="noopener noreferrer">
            Politique de confidentialité
          </Link>
          .
        </p>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors disabled:opacity-50"
          >
            Me déconnecter
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : 'Accepter et continuer'}
          </button>
        </div>
      </div>
    </div>
  );
}
