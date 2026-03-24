import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BottomNav } from './BottomNav.tsx';
import { BrandHeader } from './BrandHeader.tsx';
import { Footer } from './Footer.tsx';
import { SessionExpiredBanner } from './SessionExpiredBanner.tsx';

export function PublicLayout() {
  const { pathname } = useLocation();
  const { user, bumpDataGeneration } = useAuth();
  const prevPathname = useRef(pathname);

  // Scroll to top and refresh data on ROUTE changes only.
  // We deliberately depend on pathname (string) instead of user (object ref)
  // because Supabase fires SIGNED_IN on every visibilitychange, creating a new
  // user object reference. That was causing spurious dataGeneration bumps and
  // full data re-fetches on every tab return — even after 1 second.
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      window.scrollTo(0, 0);
      if (user) bumpDataGeneration();
      prevPathname.current = pathname;
    }
  }, [pathname, user, bumpDataGeneration]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <a href="#main-content" className="skip-to-content">
        Aller au contenu principal
      </a>
      <BrandHeader />
      <SessionExpiredBanner />
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
