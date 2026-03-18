import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-brand mb-4">404</p>
        <h1 className="text-2xl font-bold text-heading mb-2">Page introuvable</h1>
        <p className="text-body mb-8">La page que tu cherches n'existe pas ou a été déplacée.</p>
        <Link to="/" className="cta-gradient inline-block px-6 py-3 rounded-xl font-semibold">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
