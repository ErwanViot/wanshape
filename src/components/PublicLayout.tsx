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

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll-to-top + data refetch on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    bumpDataGeneration();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <a href="#main-content" className="skip-to-content">
        Aller au contenu principal
      </a>
      <BrandHeader />
      <SessionExpiredBanner />
      <main id="main-content" className="flex-1 pb-16 md:pb-0" key={pathname}>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
