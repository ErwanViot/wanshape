import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { BackLink } from './BackLink.tsx';
import { FormInput } from './FormInput.tsx';

export function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useDocumentHead({
    title: 'Connexion',
    description: 'Connecte-toi à ton compte Wan2Fit.',
  });

  if (!loading && user) return <Navigate to="/suivi" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err);
    } catch {
      setError('Une erreur est survenue. Réessaie plus tard.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-12 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md">
        <BackLink />

        <h1 className="text-2xl font-bold text-heading mb-8">Connexion</h1>

        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email"
              inputId="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-strong">
                  Mot de passe
                </label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs text-link hover:text-link-hover transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ton mot de passe"
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
              className="w-full py-3 rounded-xl text-white font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

        </div>

        <p className="text-center text-sm text-muted mt-6">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="text-link hover:text-link-hover transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
