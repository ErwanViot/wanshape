import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AuthButton } from './auth/AuthButton.tsx';
import { LocaleToggle } from './LocaleToggle.tsx';
import { NavDropdown } from './NavDropdown.tsx';

const matchExplore = (p: string) => p === '/decouvrir' || p.startsWith('/formats') || p.startsWith('/exercices');
const matchPrograms = (p: string) => p.startsWith('/programme');
const matchSessions = (p: string) => p === '/seances' || p.startsWith('/seance');
const matchRecipes = (p: string) => p.startsWith('/nutrition/recettes') || p.startsWith('/en/nutrition/recipes');
const matchPlate = (p: string) => p === '/nutrition' || p.startsWith('/nutrition/setup');

const TRAIN_ITEMS = [
  { to: '/seances', labelKey: 'my_sessions', match: matchSessions },
  { to: '/programmes', labelKey: 'my_programs', match: matchPrograms },
] as const;

const NUTRITION_ITEMS = [
  { to: '/nutrition', labelKey: 'my_plate', match: matchPlate },
  { to: '/nutrition/recettes', labelKey: 'recipes', match: matchRecipes },
] as const;

const VISITOR_ITEMS = [
  { to: '/decouvrir', labelKey: 'explore', match: matchExplore },
  { to: '/programmes', labelKey: 'programs', match: matchPrograms },
  { to: '/nutrition/recettes', labelKey: 'recipes', match: matchRecipes },
] as const;

function NavLink({ to, labelKey, active }: { to: string; labelKey: string; active: boolean }) {
  const { t } = useTranslation('nav');
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'text-brand bg-brand/10' : 'text-muted hover:text-heading hover:bg-divider'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {t(labelKey)}
    </Link>
  );
}

export function BrandHeader() {
  const { pathname } = useLocation();
  const { user, profile } = useAuth();
  const { t } = useTranslation('nav');

  const isLoggedIn = !!user;
  const isPremium = profile?.subscription_tier === 'premium';
  const showPricing = !isPremium;
  const isPricingActive = pathname === '/tarifs';
  const isExploreActive = matchExplore(pathname);
  const isTrackingActive = pathname === '/suivi';

  return (
    <header className="px-6 md:px-10 lg:px-14 py-4 border-b border-divider">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo-wan2fit.png" alt="" className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
          <span className="font-display text-lg font-black tracking-tight gradient-text">Wan2Fit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label={t('main_label')}>
          {isLoggedIn ? (
            <>
              <NavDropdown triggerLabelKey="train" items={TRAIN_ITEMS} />
              <NavLink to="/decouvrir" labelKey="explore" active={isExploreActive} />
              <NavDropdown triggerLabelKey="nutrition" items={NUTRITION_ITEMS} />
              <NavLink to="/suivi" labelKey="tracking" active={isTrackingActive} />
            </>
          ) : (
            VISITOR_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} labelKey={item.labelKey} active={item.match(pathname)} />
            ))
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {showPricing && (
            <Link
              to="/tarifs"
              className={`hidden md:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isPricingActive ? 'text-brand bg-brand/10' : 'text-muted hover:text-heading hover:bg-divider'
              }`}
              aria-current={isPricingActive ? 'page' : undefined}
            >
              {t('pricing')}
            </Link>
          )}
          <LocaleToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
