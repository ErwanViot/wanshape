import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AuthButton } from './auth/AuthButton.tsx';
import { LocaleToggle } from './LocaleToggle.tsx';

const NAV_ITEMS = [
  { to: '/', labelKey: 'home', match: (p: string) => p === '/' },
  {
    to: '/seances',
    labelKey: 'sessions',
    match: (p: string) => p === '/seances' || p.startsWith('/seance'),
    requiresAuth: true,
  },
  {
    to: '/decouvrir',
    labelKey: 'explore',
    match: (p: string) => p === '/decouvrir' || p.startsWith('/formats') || p.startsWith('/exercices'),
  },
  { to: '/programmes', labelKey: 'programs', match: (p: string) => p.startsWith('/programme') },
  { to: '/tarifs', labelKey: 'pricing', match: (p: string) => p === '/tarifs' },
  { to: '/nutrition', labelKey: 'nutrition', match: (p: string) => p.startsWith('/nutrition'), requiresAuth: true },
  { to: '/suivi', labelKey: 'tracking', match: (p: string) => p === '/suivi', requiresAuth: true },
] as const;

export function BrandHeader() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation('nav');

  return (
    <header className="px-6 md:px-10 lg:px-14 py-4 border-b border-divider">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-wan2fit.png" alt="" className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
          <span className="font-display text-lg font-black tracking-tight gradient-text">Wan2Fit</span>
        </Link>

        {/* Nav — desktop only, BottomNav handles mobile */}
        <nav className="hidden md:flex items-center gap-1" aria-label={t('main_label')}>
          {NAV_ITEMS.filter((item) => !('requiresAuth' in item && item.requiresAuth) || user).map((item) => {
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
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <LocaleToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
