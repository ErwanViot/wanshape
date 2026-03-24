import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BottomNav } from './BottomNav.tsx';
import { BrandHeader } from './BrandHeader.tsx';
import { Footer } from './Footer.tsx';
import { SessionExpiredBanner } from './SessionExpiredBanner.tsx';

export function PublicLayout() {
  const { pathname } = useLocation();
  const { bumpDataGeneration } = useAuth();

  // Scroll to top and force data refetch on every route change.
  // This ensures navigating to a page always gets fresh data from Supabase.
  useEffect(() => {
    window.scrollTo(0, 0);
    bumpDataGeneration();
  }, [pathname, bumpDataGeneration]);

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
