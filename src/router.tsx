import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Exercises } from './components/Exercises.tsx';
import { Formats } from './components/Formats.tsx';
import { Home } from './components/Home.tsx';
import { LoadingFallback } from './components/LoadingFallback.tsx';
import { PlayerPage } from './components/Player.tsx';
import { PlayerLayout } from './components/PlayerLayout.tsx';
import { PublicLayout } from './components/PublicLayout.tsx';

// Lazy-loaded secondary routes
const LazyLegal = lazy(() => import('./components/Legal.tsx').then((m) => ({ default: m.Legal })));
const LazyFormatPage = lazy(() => import('./components/FormatPage.tsx').then((m) => ({ default: m.FormatPage })));
const LazyExercisePage = lazy(() => import('./components/ExercisePage.tsx').then((m) => ({ default: m.ExercisePage })));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public pages — shared wrapper (min-h-screen bg-surface)
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'formats', element: <Formats /> },
      {
        path: 'formats/:slug',
        element: (
          <Lazy>
            <LazyFormatPage />
          </Lazy>
        ),
      },
      { path: 'exercices', element: <Exercises /> },
      {
        path: 'exercices/:slug',
        element: (
          <Lazy>
            <LazyExercisePage />
          </Lazy>
        ),
      },
      {
        path: 'legal/:tab',
        element: (
          <Lazy>
            <LazyLegal />
          </Lazy>
        ),
      },
    ],
  },
  // Player — full screen, no chrome
  {
    element: <PlayerLayout />,
    children: [
      { path: 'seance/play', element: <PlayerPage /> },
      // Legacy URLs with date → redirect to dateless route
      { path: 'seance/:dateKey/play', element: <PlayerPage /> },
      { path: 'seance/:dateKey', element: <Navigate to="/seance/play" replace /> },
    ],
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
