import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

export function PlayerLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
}
