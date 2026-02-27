import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

export function PlayerLayout() {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll-to-top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <main>
      <Outlet />
    </main>
  );
}
