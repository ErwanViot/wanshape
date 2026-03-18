import { type FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { FormInput } from './FormInput.tsx';

export function UpdatePasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useDocumentHead({
    title: 'Nouveau mot de passe',
    description: 'Choisis un nouveau mot de passe pour ton compte Wan2Fit.',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
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
          setTimeout(() => resolve({ error: 'Le serveur met trop de temps à répondre. Veuillez réessayer.' }), 30_000),
        ),
      ]);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
      } else {
        window.location.replace('/');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
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
          <p className="text-strong font-medium mb-1">Lien expiré ou invalide</p>
          <p className="text-sm text-muted mb-6">Veuillez refaire une demande de réinitialisation.</p>
          <Link to="/mot-de-passe-oublie" className="text-link hover:text-link-hover transition-colors text-sm">
            Mot de passe oublié
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-heading mb-8">Nouveau mot de passe</h1>

        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nouveau mot de passe"
              inputId="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
            />

            <FormInput
              label="Confirmer le mot de passe"
              inputId="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Retapez le mot de passe"
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
              {submitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
