import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth } from './components/auth/RequireAuth.tsx';
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
const LazyLoginPage = lazy(() => import('./components/auth/LoginPage.tsx').then((m) => ({ default: m.LoginPage })));
const LazySignupPage = lazy(() => import('./components/auth/SignupPage.tsx').then((m) => ({ default: m.SignupPage })));
const LazyAuthCallback = lazy(() =>
  import('./components/auth/AuthCallback.tsx').then((m) => ({ default: m.AuthCallback })),
);
const LazyProfilePage = lazy(() =>
  import('./components/auth/ProfilePage.tsx').then((m) => ({ default: m.ProfilePage })),
);
const LazyDiscover = lazy(() => import('./components/Discover.tsx').then((m) => ({ default: m.Discover })));
const LazyProgramList = lazy(() => import('./components/ProgramList.tsx').then((m) => ({ default: m.ProgramList })));
const LazyProgramPage = lazy(() => import('./components/ProgramPage.tsx').then((m) => ({ default: m.ProgramPage })));
const LazyProgramPlayerPage = lazy(() =>
  import('./components/ProgramPlayerPage.tsx').then((m) => ({ default: m.ProgramPlayerPage })),
);
const LazyResetPasswordPage = lazy(() =>
  import('./components/auth/ResetPasswordPage.tsx').then((m) => ({ default: m.ResetPasswordPage })),
);
const LazyUpdatePasswordPage = lazy(() =>
  import('./components/auth/UpdatePasswordPage.tsx').then((m) => ({ default: m.UpdatePasswordPage })),
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public pages — shared wrapper (min-h-screen bg-surface)
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'decouvrir',
        element: (
          <Lazy>
            <LazyDiscover />
          </Lazy>
        ),
      },
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
      // Auth routes
      {
        path: 'login',
        element: (
          <Lazy>
            <LazyLoginPage />
          </Lazy>
        ),
      },
      {
        path: 'signup',
        element: (
          <Lazy>
            <LazySignupPage />
          </Lazy>
        ),
      },
      {
        path: 'mot-de-passe-oublie',
        element: (
          <Lazy>
            <LazyResetPasswordPage />
          </Lazy>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <Lazy>
            <LazyUpdatePasswordPage />
          </Lazy>
        ),
      },
      {
        path: 'auth/callback',
        element: (
          <Lazy>
            <LazyAuthCallback />
          </Lazy>
        ),
      },
      {
        path: 'profil',
        element: (
          <Lazy>
            <RequireAuth>
              <LazyProfilePage />
            </RequireAuth>
          </Lazy>
        ),
      },
      // Programme routes
      {
        path: 'programmes',
        element: (
          <Lazy>
            <LazyProgramList />
          </Lazy>
        ),
      },
      {
        path: 'programme/:slug',
        element: (
          <Lazy>
            <LazyProgramPage />
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
      // Programme player
      {
        path: 'programme/:slug/seance/:order/play',
        element: (
          <Lazy>
            <LazyProgramPlayerPage />
          </Lazy>
        ),
      },
    ],
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
