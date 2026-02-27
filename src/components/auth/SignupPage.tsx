import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';

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
    description: 'Créez votre compte gratuit pour sauvegarder vos séances et suivre vos progrès.',
  });

  if (!loading && user) return <Navigate to="/profil" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
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
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
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
                Un lien de confirmation a été envoyé à <strong className="text-strong">{email}</strong>
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

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-strong mb-1.5">
                Mot de passe
              </label>
              <input
                id="signup-password"
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
                <Link to="/legal/privacy" target="_blank" className="text-link hover:text-link-hover transition-colors">
                  Politique de confidentialité
                </Link>
              </span>
            </label>

            {/* tl;dr */}
            <div className="rounded-xl bg-surface border border-divider p-3.5 text-xs text-muted space-y-1">
              <p className="font-semibold text-subtle">En bref (pour ceux qui ne lisent pas les CGU) 😉</p>
              <ul className="space-y-0.5 list-inside">
                <li>C'est gratuit, pas de piège.</li>
                <li>On stocke votre email, votre prénom et vos séances. C'est tout.</li>
                <li>On ne revend pas vos données.</li>
                <li>Les exercices sont du contenu éditorial, pas du coaching : libre à vous de les suivre ou non.</li>
                <li>On n'est pas médecins — consultez le vôtre avant de suer.</li>
                <li>Vous pouvez supprimer votre compte quand vous voulez.</li>
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
              className="w-full py-3 rounded-xl text-white font-semibold cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
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
