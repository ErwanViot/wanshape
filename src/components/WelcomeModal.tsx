import type { User } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase.ts';

export function useShowWelcome(user: User | null): boolean {
  if (!user) return false;
  return !user.user_metadata?.onboarded;
}

async function markOnboarded() {
  if (!supabase) return;
  await supabase.auth.updateUser({ data: { onboarded: true } });
}

interface Props {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: Props) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const selector = 'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])';
    const focusable = dialog.querySelectorAll<HTMLElement>(selector);
    if (focusable.length > 0) focusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        markOnboarded();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const els = dialog!.querySelectorAll<HTMLElement>(selector);
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];

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
  }, [onClose]);

  const handleChoice = (path: string) => {
    markOnboarded();
    onClose();
    navigate(path);
  };

  const handleDismiss = () => {
    markOnboarded();
    onClose();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is wired in the keydown effect above; the click here is the pointer-only click-outside dismissal.
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-20 sm:pb-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div ref={dialogRef} className="glass-card w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/images/illustration-onboarding.webp"
            alt={t('welcome_modal.image_alt')}
            className="w-full h-32 object-contain rounded-xl mx-auto"
          />
          <h2 id="welcome-title" className="text-xl font-bold text-heading">
            {t('welcome_modal.title')}
          </h2>
          <p className="text-sm text-muted">{t('welcome_modal.subtitle')}</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleChoice('/seance/play')}
            className="w-full flex items-center gap-4 rounded-2xl border border-card-border bg-surface-card p-4 text-left group hover:border-brand/30 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-heading group-hover:text-brand transition-colors">
                {t('welcome_modal.option_today_title')}
              </p>
              <p className="text-xs text-muted">{t('welcome_modal.option_today_desc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChoice('/programmes')}
            className="w-full flex items-center gap-4 rounded-2xl border border-card-border bg-surface-card p-4 text-left group hover:border-brand/30 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand"
              >
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-heading group-hover:text-brand transition-colors">
                {t('welcome_modal.option_program_title')}
              </p>
              <p className="text-xs text-muted">{t('welcome_modal.option_program_desc')}</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="w-full text-center text-sm text-muted hover:text-subtle transition-colors cursor-pointer py-1"
        >
          {t('welcome_modal.dismiss')}
        </button>
      </div>
    </div>
  );
}
