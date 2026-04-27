import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { BottomNav } from './BottomNav.tsx';
import { BrandHeader } from './BrandHeader.tsx';
import { Footer } from './Footer.tsx';
import { CguRevalidationModal } from './legal/CguRevalidationModal.tsx';
import { SessionExpiredBanner } from './SessionExpiredBanner.tsx';

export function PublicLayout() {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();

  // Scroll top on route change. Data freshness is no longer tied to
  // navigation — every hook is on TanStack Query and relies on its
  // `staleTime` + mutation-side invalidation contract.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the intentional trigger; the body doesn't read it.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <a href="#main-content" className="skip-to-content">
        {t('layout.skip_to_content')}
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
