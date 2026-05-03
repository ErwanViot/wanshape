import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth } from './components/auth/RequireAuth.tsx';
import { RequirePremium } from './components/auth/RequirePremium.tsx';
import { LoadingFallback } from './components/LoadingFallback.tsx';
import { PlayerLayout } from './components/PlayerLayout.tsx';
import { PublicLayout } from './components/PublicLayout.tsx';

// Lazy-loaded routes
const LazyHome = lazy(() => import('./components/Home.tsx').then((m) => ({ default: m.Home })));
const LazyFormats = lazy(() => import('./components/Formats.tsx').then((m) => ({ default: m.Formats })));
const LazyExercises = lazy(() => import('./components/Exercises.tsx').then((m) => ({ default: m.Exercises })));
const LazyPlayerPage = lazy(() => import('./components/Player.tsx').then((m) => ({ default: m.PlayerPage })));
const LazyNotFoundPage = lazy(() => import('./components/NotFoundPage.tsx').then((m) => ({ default: m.NotFoundPage })));
const LazyLegal = lazy(() => import('./components/Legal.tsx').then((m) => ({ default: m.Legal })));
const LazyFormatPage = lazy(() => import('./components/FormatPage.tsx').then((m) => ({ default: m.FormatPage })));
const LazyExercisePage = lazy(() => import('./components/ExercisePage.tsx').then((m) => ({ default: m.ExercisePage })));
const LazyLoginPage = lazy(() => import('./components/auth/LoginPage.tsx').then((m) => ({ default: m.LoginPage })));
const LazySignupPage = lazy(() => import('./components/auth/SignupPage.tsx').then((m) => ({ default: m.SignupPage })));
const LazyAuthCallback = lazy(() =>
  import('./components/auth/AuthCallback.tsx').then((m) => ({ default: m.AuthCallback })),
);
const LazyStatsPage = lazy(() => import('./components/auth/StatsPage.tsx').then((m) => ({ default: m.StatsPage })));
const LazySettingsPage = lazy(() =>
  import('./components/auth/SettingsPage.tsx').then((m) => ({ default: m.SettingsPage })),
);
const LazyDiscover = lazy(() => import('./components/Discover.tsx').then((m) => ({ default: m.Discover })));
const LazySeancesLanding = lazy(() =>
  import('./components/landings/SeancesLanding.tsx').then((m) => ({ default: m.SeancesLanding })),
);
const LazyProgramList = lazy(() => import('./components/ProgramList.tsx').then((m) => ({ default: m.ProgramList })));
const LazyProgramContentPage = lazy(() =>
  import('./components/ProgramContentPage.tsx').then((m) => ({ default: m.ProgramContentPage })),
);
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
const LazyCustomSessionPage = lazy(() =>
  import('./components/CustomSessionPage.tsx').then((m) => ({ default: m.CustomSessionPage })),
);
const LazyCreateProgramPage = lazy(() =>
  import('./components/CreateProgramPage.tsx').then((m) => ({ default: m.CreateProgramPage })),
);
const LazyCustomSessionPreviewPage = lazy(() =>
  import('./components/CustomSessionPreviewPage.tsx').then((m) => ({ default: m.CustomSessionPreviewPage })),
);
const LazyCustomPlayerPage = lazy(() =>
  import('./components/CustomPlayerPage.tsx').then((m) => ({ default: m.CustomPlayerPage })),
);
const LazyPricingPage = lazy(() => import('./components/PricingPage.tsx').then((m) => ({ default: m.PricingPage })));
const LazyPremiumPromoPage = lazy(() =>
  import('./components/PremiumPromoPage.tsx').then((m) => ({ default: m.PremiumPromoPage })),
);
const LazyAboutPage = lazy(() => import('./components/AboutPage.tsx').then((m) => ({ default: m.AboutPage })));
const LazySeancesPage = lazy(() => import('./components/SeancesPage.tsx').then((m) => ({ default: m.SeancesPage })));
const LazyNutritionPage = lazy(() =>
  import('./components/NutritionPage.tsx').then((m) => ({ default: m.NutritionPage })),
);
const LazyNutritionSetupPage = lazy(() =>
  import('./components/NutritionSetupPage.tsx').then((m) => ({ default: m.NutritionSetupPage })),
);
const LazyRecipeListPage = lazy(() =>
  import('./components/recipes/RecipeListPage.tsx').then((m) => ({ default: m.RecipeListPage })),
);
const LazyRecipeDetailPage = lazy(() =>
  import('./components/recipes/RecipeDetailPage.tsx').then((m) => ({ default: m.RecipeDetailPage })),
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public pages — shared wrapper (min-h-screen bg-surface)
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <LazyHome />
          </Lazy>
        ),
      },
      {
        path: 'decouvrir',
        element: (
          <Lazy>
            <LazyDiscover />
          </Lazy>
        ),
      },
      // Public feature landings — visitor-facing presentation of auth-only sections
      {
        path: 'decouvrir/seances',
        element: (
          <Lazy>
            <LazySeancesLanding />
          </Lazy>
        ),
      },
      {
        path: 'formats',
        element: (
          <Lazy>
            <LazyFormats />
          </Lazy>
        ),
      },
      {
        path: 'formats/:slug',
        element: (
          <Lazy>
            <LazyFormatPage />
          </Lazy>
        ),
      },
      {
        path: 'exercices',
        element: (
          <Lazy>
            <LazyExercises />
          </Lazy>
        ),
      },
      {
        path: 'exercices/:slug',
        element: (
          <Lazy>
            <LazyExercisePage />
          </Lazy>
        ),
      },
      // Public recipes — accessible without auth, indexable by SEO.
      // FR is the canonical namespace; EN lives under `/en/` with localised
      // path segments so the URLs themselves are translated for SEO.
      {
        path: 'nutrition/recettes',
        element: (
          <Lazy>
            <LazyRecipeListPage />
          </Lazy>
        ),
      },
      {
        path: 'nutrition/recettes/:slug',
        element: (
          <Lazy>
            <LazyRecipeDetailPage />
          </Lazy>
        ),
      },
      {
        path: 'en/nutrition/recipes',
        element: (
          <Lazy>
            <LazyRecipeListPage />
          </Lazy>
        ),
      },
      {
        path: 'en/nutrition/recipes/:slug',
        element: (
          <Lazy>
            <LazyRecipeDetailPage />
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
        path: 'suivi',
        element: (
          <Lazy>
            <RequireAuth>
              <LazyStatsPage />
            </RequireAuth>
          </Lazy>
        ),
      },
      { path: 'stats', element: <Navigate to="/suivi" replace /> },
      {
        path: 'seances',
        element: (
          <Lazy>
            <RequireAuth>
              <LazySeancesPage />
            </RequireAuth>
          </Lazy>
        ),
      },
      {
        path: 'nutrition',
        element: (
          <Lazy>
            <RequireAuth>
              <LazyNutritionPage />
            </RequireAuth>
          </Lazy>
        ),
      },
      {
        path: 'nutrition/setup',
        element: (
          <Lazy>
            <RequireAuth>
              <LazyNutritionSetupPage />
            </RequireAuth>
          </Lazy>
        ),
      },
      {
        path: 'parametres',
        element: (
          <Lazy>
            <RequireAuth>
              <LazySettingsPage />
            </RequireAuth>
          </Lazy>
        ),
      },
      // Legacy redirects
      { path: 'profil', element: <Navigate to="/suivi" replace /> },
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
            <LazyProgramContentPage />
          </Lazy>
        ),
      },
      {
        path: 'programme/:slug/suivi',
        element: (
          <Lazy>
            <RequireAuth>
              <LazyProgramPage />
            </RequireAuth>
          </Lazy>
        ),
      },
      // Pricing
      {
        path: 'tarifs',
        element: (
          <Lazy>
            <LazyPricingPage />
          </Lazy>
        ),
      },
      {
        path: 'premium',
        element: (
          <Lazy>
            <LazyPremiumPromoPage />
          </Lazy>
        ),
      },
      {
        path: 'a-propos',
        element: (
          <Lazy>
            <LazyAboutPage />
          </Lazy>
        ),
      },
      // Premium routes — always registered, guarded by RequirePremium
      {
        path: 'seance/custom',
        element: (
          <Lazy>
            <RequirePremium>
              <LazyCustomSessionPage />
            </RequirePremium>
          </Lazy>
        ),
      },
      {
        path: 'seance/custom/:id',
        element: (
          <Lazy>
            <RequirePremium>
              <LazyCustomSessionPreviewPage />
            </RequirePremium>
          </Lazy>
        ),
      },
      {
        path: 'programme/creer',
        element: (
          <Lazy>
            <RequirePremium>
              <LazyCreateProgramPage />
            </RequirePremium>
          </Lazy>
        ),
      },
    ],
  },
  // Player — full screen, no chrome
  {
    element: <PlayerLayout />,
    children: [
      {
        path: 'seance/play',
        element: (
          <Lazy>
            <LazyPlayerPage />
          </Lazy>
        ),
      },
      // Legacy URLs with date → redirect to dateless route
      {
        path: 'seance/:dateKey/play',
        element: (
          <Lazy>
            <LazyPlayerPage />
          </Lazy>
        ),
      },
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
      // Custom session player
      {
        path: 'seance/custom/:id/play',
        element: (
          <Lazy>
            <RequirePremium>
              <LazyCustomPlayerPage />
            </RequirePremium>
          </Lazy>
        ),
      },
    ],
  },
  // Catch-all — 404
  {
    path: '*',
    element: (
      <Lazy>
        <LazyNotFoundPage />
      </Lazy>
    ),
  },
]);
