import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { BackLink } from './BackLink.tsx';
import { FormInput } from './FormInput.tsx';

export function SignupPage() {
  const { user, loading, signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useDocumentHead({
    title: 'Créer un compte',
    description: 'Crée ton compte gratuit pour suivre ta progression et ne rien perdre.',
  });

  if (!loading && user) return <Navigate to="/suivi" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await signUp(email.trim(), password, displayName.trim());
      if (err) {
        setError(err);
      } else {
        setSent(true);
      }
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

        <h1 className="text-2xl font-bold text-heading mb-8">Crée ton compte</h1>

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
              <p className="text-strong font-medium mb-1">Vérifie ta boîte mail</p>
              <p className="text-sm text-muted">
                Un lien de confirmation a été envoyé à <strong className="text-strong">{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Prénom ou pseudo"
                inputId="signup-name"
                type="text"
                required
                autoComplete="given-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex"
              />

              <FormInput
                label="Email"
                inputId="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
              />

              <FormInput
                label="Mot de passe"
                inputId="signup-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
              />

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptedCgu}
                  onChange={(e) => setAcceptedCgu(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-divider accent-brand"
                />
                <span className="text-sm text-muted">
                  J'accepte les{' '}
                  <Link to="/legal/cgu" target="_blank" className="text-link hover:text-link-hover transition-colors">
                    Conditions Générales d'Utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link
                    to="/legal/privacy"
                    target="_blank"
                    className="text-link hover:text-link-hover transition-colors"
                  >
                    Politique de confidentialité
                  </Link>
                </span>
              </label>

              {/* tl;dr */}
              <div className="rounded-xl bg-surface border border-divider p-3.5 text-xs text-muted space-y-1">
                <p className="font-semibold text-subtle">En bref (pour ceux qui ne lisent pas les CGU) 😉</p>
                <ul className="space-y-0.5 list-inside">
                  <li>Le compte est gratuit, sans engagement.</li>
                  <li>On stocke ton email, ton prénom et tes séances.</li>
                  <li>On ne revend pas tes données.</li>
                  <li>Les exercices sont des suggestions, pas du coaching médical.</li>
                  <li>Tu peux supprimer ton compte quand tu veux.</li>
                </ul>
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
                {submitting ? 'Création...' : 'Créer mon compte'}
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
