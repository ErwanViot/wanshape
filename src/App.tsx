import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { hideNativeSplash } from './lib/capacitor.ts';
import { queryClient } from './lib/queryClient.ts';
import { router } from './router.tsx';

// Dev-only: TanStack Query Devtools. `import.meta.env.DEV` is statically
// replaced by Vite at build time, so the whole lazy(...) branch becomes
// `null` in production and the devtools chunk is tree-shaken out.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : null;

export default function App() {
  // SplashScreen.hide is idempotent, so the StrictMode double-effect in dev
  // is safe. No cleanup needed — the splash is already gone after first call.
  useEffect(() => {
    void hideNativeSplash();
  }, []);

  // QueryClientProvider sits INSIDE ErrorBoundary so any TanStack-originated
  // render error is captured by Sentry via the boundary's componentDidCatch.
  // A provider above the boundary would leak those errors to React's root
  // uncaught handler. The devtools live under the same provider so they can
  // read the real query cache.
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
