import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { supabase } from '../../lib/supabase.ts';

const TIMEOUT_MS = 15_000;

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useDocumentHead({ title: 'Connexion en cours' });

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (!supabase) {
      setError('Auth non disponible');
      return;
    }

    const client = supabase;

    const timeout = setTimeout(() => {
      setError('La connexion prend trop de temps. Veuillez réessayer.');
    }, TIMEOUT_MS);

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      client.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        clearTimeout(timeout);
        if (err) {
          // Code exchange failed — session may already be active via onAuthStateChange
          client.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              navigate('/profil', { replace: true });
            } else {
              setError(err.message);
            }
          });
        } else {
          navigate('/profil', { replace: true });
        }
      });
    } else {
      // No code — check if session is already present (hash fragment flow)
      client.auth.getSession().then(({ data: { session } }) => {
        clearTimeout(timeout);
        if (session) {
          navigate('/profil', { replace: true });
        } else {
          setError('Code de vérification manquant');
        }
      });
    }

    return () => clearTimeout(timeout);
  }, [navigate]);

  if (error) {
    return (
      <main className="px-6 py-12 flex-1 flex items-start justify-center">
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
          <p className="text-strong font-medium mb-1">Erreur de connexion</p>
          <p className="text-sm text-muted mb-6">{error}</p>
          <Link to="/login" className="text-link hover:text-link-hover transition-colors text-sm">
            Retour à la connexion
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12 flex-1 flex items-center justify-center">
      <output className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-muted">Connexion en cours...</p>
      </output>
    </main>
  );
}
