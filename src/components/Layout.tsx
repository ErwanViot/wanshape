import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
}
