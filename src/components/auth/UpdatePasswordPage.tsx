import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { isPasswordStrong } from '../../utils/password.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { FormInput } from './FormInput.tsx';

export function UpdatePasswordPage() {
  const { t } = useTranslation('auth');
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useDocumentHead({
    title: t('update_password.page_title'),
    description: t('update_password.page_description'),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong(password)) {
      setError(t('errors.password_too_weak'));
      return;
    }
    if (password !== confirm) {
      setError(t('errors.passwords_mismatch'));
      return;
    }

    setSubmitting(true);
    try {
      // Race against a timeout — updateUser can hang if the recovery session
      // triggers an auth state change that interferes with the async flow.
      // On timeout we show an error instead of falsely reporting success.
      const result = await Promise.race([
        updatePassword(password),
        new Promise<{ error: string | null }>((resolve) =>
          setTimeout(() => resolve({ error: t('errors.timeout') }), 30_000),
        ),
      ]);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
      } else {
        window.location.replace('/');
      }
    } catch {
      setError(t('errors.generic_retry'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-12 flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-6 py-12 flex-1 flex items-start justify-center">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-strong font-medium mb-1">{t('update_password.expired_title')}</p>
          <p className="text-sm text-muted mb-6">{t('update_password.expired_message')}</p>
          <Link to="/mot-de-passe-oublie" className="text-link hover:text-link-hover transition-colors text-sm">
            {t('update_password.expired_link')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-heading mb-8">{t('update_password.heading')}</h1>

        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label={t('update_password.label_new')}
              inputId="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('update_password.placeholder_new')}
            />

            <FormInput
              label={t('update_password.label_confirm')}
              inputId="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t('update_password.placeholder_confirm')}
            />

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('update_password.submitting') : t('update_password.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
