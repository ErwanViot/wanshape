import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getInitials } from '../utils/getInitials.ts';

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
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-1.5 py-1.5 transition-colors ${
        active ? 'text-brand' : 'text-muted'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
      <span className="text-xs font-medium leading-tight">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();
  const { user, profile, loading } = useAuth();

  const isHome = pathname === '/';
  const isDiscover = pathname === '/decouvrir' || pathname.startsWith('/formats') || pathname.startsWith('/exercices');
  const isPrograms = pathname.startsWith('/programme');
  const isProfile = pathname === '/profil' || pathname === '/login' || pathname === '/signup';

  const profileTo = user ? '/profil' : '/login';
  const profileLabel = user ? 'Profil' : 'Connexion';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-divider md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        <NavItem to="/" label="Accueil" active={isHome}>
          <HomeIcon />
        </NavItem>
        <NavItem to="/decouvrir" label="Découvrir" active={isDiscover}>
          <DiscoverIcon />
        </NavItem>
        <NavItem to="/programmes" label="Programmes" active={isPrograms}>
          <ProgramsIcon />
        </NavItem>
        <NavItem to={profileTo} label={profileLabel} active={isProfile}>
          {!loading && user ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold bg-brand">
              {getInitials(profile?.display_name ?? user.user_metadata?.display_name, user.email)}
            </div>
          ) : (
            <UserIcon />
          )}
        </NavItem>
      </div>
    </nav>
  );
}
