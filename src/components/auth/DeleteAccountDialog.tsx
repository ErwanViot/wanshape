import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteAccount } from '../../hooks/useDeleteAccount.ts';

const CONFIRMATION_WORD = 'SUPPRIMER';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

// Modal that gates account deletion behind a typed confirmation word so
// the user cannot wipe their account by tapping a button twice in a row.
// Backed by useDeleteAccount which calls the delete-account edge function.
export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const { t } = useTranslation('settings');
  const { deleteAccount, pending } = useDeleteAccount();
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setConfirmation('');
      setError(null);
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const canSubmit = confirmation === CONFIRMATION_WORD && !pending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    const err = await deleteAccount();
    if (err) {
      setError(err);
      return;
    }
    onClose();
    // signOut already cleared local state; redirect to home.
    window.location.href = '/';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${inputId}-title`}
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-card border border-card-border shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
            </span>
            <h2 id={`${inputId}-title`} className="text-lg font-bold text-heading">
              {t('danger_zone.confirm_title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label={t('danger_zone.cancel')}
            className="p-1 -m-1 text-muted hover:text-heading transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-body">{t('danger_zone.confirm_body')}</p>
        <ul className="text-xs text-muted list-disc pl-5 space-y-1">
          <li>{t('danger_zone.bullet_data')}</li>
          <li>{t('danger_zone.bullet_subscription')}</li>
          <li>{t('danger_zone.bullet_irreversible')}</li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor={inputId} className="block text-xs font-medium text-strong">
            {t('danger_zone.confirm_label', { word: CONFIRMATION_WORD })}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={pending}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={CONFIRMATION_WORD}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-heading placeholder:text-muted focus:border-red-400 focus:outline-none transition-colors"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl border border-divider text-sm font-semibold text-body hover:bg-surface transition-colors disabled:opacity-50"
            >
              {t('danger_zone.cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? t('danger_zone.deleting') : t('danger_zone.confirm_action')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
