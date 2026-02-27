import { Link, useLocation } from 'react-router';
import { useTheme } from '../hooks/useTheme.ts';
import { AuthButton } from './auth/AuthButton.tsx';

const THEME_LABELS = {
  system: 'Thème automatique (système)',
  light: 'Mode clair',
  dark: 'Mode sombre',
} as const;

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', match: (p: string) => p === '/' },
  {
    to: '/decouvrir',
    label: 'Découvrir',
    match: (p: string) => p === '/decouvrir' || p.startsWith('/formats') || p.startsWith('/exercices'),
  },
  { to: '/programmes', label: 'Programmes', match: (p: string) => p.startsWith('/programme') },
] as const;

export function BrandHeader() {
  const { preference, cycleTheme } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className="hidden md:block px-10 lg:px-14 py-4 border-b border-divider">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo-wansoft.png"
            alt=""
            className="w-8 h-8 shrink-0"
            style={{
              filter:
                'brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(4438%) hue-rotate(233deg) brightness(91%) contrast(96%)',
            }}
          />
          <span className="text-lg font-extrabold tracking-tight gradient-text">Wan Shape</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'text-brand bg-brand/10' : 'text-muted hover:text-heading hover:bg-divider'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <button
            type="button"
            onClick={cycleTheme}
            className="p-2 rounded-xl border border-divider hover:border-divider-strong transition-colors"
            aria-label={THEME_LABELS[preference]}
            title={THEME_LABELS[preference]}
          >
            {preference === 'dark' ? <MoonIcon /> : preference === 'light' ? <SunIcon /> : <AutoIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
