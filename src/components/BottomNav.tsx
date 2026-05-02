import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';

function DumbbellIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 6.5h11M6.5 17.5h11" />
      <path d="M4 10v4M8 8v8M16 8v8M20 10v4" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ProgramsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function UtensilsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  );
}

function ChefHatIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function NavItem({
  to,
  label,
  active,
  children,
}: {
  to: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-1 py-1.5 transition-colors ${
        active ? 'text-brand' : 'text-muted'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation('nav');

  const isHome = pathname === '/';
  const isSeances = pathname === '/seances' || pathname.startsWith('/seance');
  const isPrograms = pathname.startsWith('/programme');
  const isDiscover = pathname === '/decouvrir' || pathname.startsWith('/formats') || pathname.startsWith('/exercices');
  const isSuivi = pathname === '/suivi';
  const isRecipes = pathname.startsWith('/nutrition/recettes') || pathname.startsWith('/en/nutrition/recipes');
  // Match the exact /nutrition page (and its setup sub-page) only — recipes
  // own their own bottom-nav slot.
  const isNutrition = (pathname === '/nutrition' || pathname.startsWith('/nutrition/setup')) && !isRecipes;
  const isLogin = pathname === '/login' || pathname === '/signup';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-divider md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('main_label')}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {user ? (
          <>
            <NavItem to="/seances" label={t('sessions')} active={isSeances}>
              <DumbbellIcon />
            </NavItem>
            <NavItem to="/programmes" label={t('programs')} active={isPrograms}>
              <ProgramsIcon />
            </NavItem>
            <NavItem to="/nutrition" label={t('nutrition')} active={isNutrition}>
              <UtensilsIcon />
            </NavItem>
            <NavItem to="/nutrition/recettes" label={t('recipes')} active={isRecipes}>
              <ChefHatIcon />
            </NavItem>
            <NavItem to="/suivi" label={t('tracking')} active={isSuivi}>
              <ChartIcon />
            </NavItem>
          </>
        ) : (
          <>
            <NavItem to="/" label={t('home')} active={isHome}>
              <HomeIcon />
            </NavItem>
            <NavItem to="/programmes" label={t('programs')} active={isPrograms}>
              <ProgramsIcon />
            </NavItem>
            <NavItem to="/decouvrir" label={t('explore')} active={isDiscover}>
              <DiscoverIcon />
            </NavItem>
            <NavItem to="/nutrition/recettes" label={t('recipes')} active={isRecipes}>
              <ChefHatIcon />
            </NavItem>
            <NavItem to="/login" label={t('login')} active={isLogin}>
              <UserIcon />
            </NavItem>
          </>
        )}
      </div>
    </nav>
  );
}
