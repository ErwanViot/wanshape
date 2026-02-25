import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';

export function SignupPage() {
  const { user, loading, signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useDocumentHead({
    title: 'Créer un compte',
    description: 'Créez votre compte gratuit pour sauvegarder vos séances et suivre vos progrès.',
  });

  if (!loading && user) return <Navigate to="/profil" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signUp(email.trim(), displayName.trim());
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="px-6 py-12 flex-1 flex items-start justify-center">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-strong transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </Link>

        <h1 className="text-2xl font-bold text-heading mb-8">Créer un compte</h1>

        <div className="glass-card rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4">
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
              <p className="text-strong font-medium mb-1">Vérifiez votre boîte mail</p>
              <p className="text-sm text-muted">
                Un lien de connexion a été envoyé à <strong className="text-strong">{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-strong mb-1.5">
                  Prénom ou pseudo
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-heading placeholder:text-muted focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-strong mb-1.5">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
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
                {submitting ? 'Envoi en cours...' : 'Recevoir le lien magique'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-link hover:text-link-hover transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
