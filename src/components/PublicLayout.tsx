import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BottomNav } from './BottomNav.tsx';
import { BrandHeader } from './BrandHeader.tsx';
import { Footer } from './Footer.tsx';
import { CguRevalidationModal } from './legal/CguRevalidationModal.tsx';
import { SessionExpiredBanner } from './SessionExpiredBanner.tsx';

export function PublicLayout() {
  const { pathname } = useLocation();
  const { user, bumpDataGeneration } = useAuth();

  // Navigation bumps the legacy `dataGeneration` counter so hooks still on
  // the pre-TanStack pattern refetch on every route change (old contract).
  // Queries already migrated to TanStack Query are NOT invalidated here on
  // purpose: they rely on `staleTime` + mutation-side invalidation
  // (useSaveCompletion, etc.) to stay fresh. Mirroring this effect into
  // `queryClient.invalidateQueries()` would refetch every cache entry on
  // every navigation and negate the cache benefit we just introduced.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) bumpDataGeneration();
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
      <CguRevalidationModal />
    </div>
  );
}
