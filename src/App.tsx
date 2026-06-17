import type { PluginListenerHandle } from '@capacitor/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { OnboardingCarousel } from './components/onboarding/OnboardingCarousel.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useOnboarding } from './hooks/useOnboarding.ts';
import { hideNativeSplash } from './lib/capacitor.ts';
import { registerDeepLinkListener } from './lib/deepLinks.ts';
import { queryClient } from './lib/queryClient.ts';
import { router } from './router.tsx';

// Dev-only: TanStack Query Devtools. `import.meta.env.DEV` is statically
// replaced by Vite at build time, so the whole lazy(...) branch becomes
// `null` in production and the devtools chunk is tree-shaken out.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : null;

export default function App() {
  const onboarding = useOnboarding();

  // SplashScreen.hide is idempotent, so the StrictMode double-effect in dev
  // is safe. No cleanup needed — the splash is already gone after first call.
  useEffect(() => {
    void hideNativeSplash();
  }, []);

  useEffect(() => {
    // The listener registration is async; if the effect is torn down before
    // it resolves (StrictMode double-mount in dev, fast unmount in tests),
    // we must still remove the handle once it lands. The cancelled flag
    // ensures we never leak a listener nor try to remove a handle twice.
    let cancelled = false;
    let activeHandle: PluginListenerHandle | null = null;
    void registerDeepLinkListener().then((handle) => {
      if (cancelled) {
        handle?.remove();
      } else {
        activeHandle = handle;
      }
    });
    return () => {
      cancelled = true;
      activeHandle?.remove();
    };
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
        {/* Native first-launch onboarding renders ABOVE the router so the
            router can stay mounted for the post-onboarding navigate. The
            hook short-circuits on web (state === 'done') so the overlay
            never mounts in the PWA. */}
        {onboarding.state === 'pending' && (
          <OnboardingCarousel
            onComplete={() => {
              void onboarding.markCompleted();
            }}
            onLogin={() => {
              void router.navigate('/signup');
            }}
            onExplore={() => {
              void router.navigate('/');
            }}
          />
        )}
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
