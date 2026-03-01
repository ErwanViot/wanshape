import { type FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';

export function UpdatePasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useDocumentHead({
    title: 'Nouveau mot de passe',
    description: 'Choisissez un nouveau mot de passe pour votre compte WanShape.',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(err);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-12 flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
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

  if (success) {
    return (
      <div className="px-6 py-12 flex-1 flex items-start justify-center">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-6 text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-strong font-medium mb-1">Mot de passe mis à jour</p>
            <p className="text-sm text-muted mb-6">Votre nouveau mot de passe est actif.</p>
            <Link
              to="/profil"
              replace
              className="inline-block px-6 py-3 rounded-xl text-white font-semibold cta-gradient"
            >
              Accéder à mon profil
            </Link>
          </div>
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
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-strong mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-heading placeholder:text-muted focus:border-brand focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-strong mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-heading placeholder:text-muted focus:border-brand focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
