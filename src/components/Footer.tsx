import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="px-6 py-8 border-t border-divider">
      <p className="text-faint text-xs text-center">
        WAN SHAPE par{' '}
        <a
          href="https://www.wan-soft.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-subtle underline transition-colors"
        >
          WAN SOFT
        </a>
      </p>
      <div className="flex justify-center gap-4 mt-3">
        <Link to="/legal/mentions" className="text-xs text-faint hover:text-subtle transition-colors">
          Mentions légales
        </Link>
        <Link to="/legal/privacy" className="text-xs text-faint hover:text-subtle transition-colors">
          Confidentialité
        </Link>
        <Link to="/legal/cgu" className="text-xs text-faint hover:text-subtle transition-colors">
          CGU
        </Link>
      </div>
    </footer>
  );
}
