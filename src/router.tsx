import { createBrowserRouter, Navigate } from 'react-router';
import { Home } from './components/Home.tsx';
import { PlayerPage } from './components/Player.tsx';
import { Legal } from './components/Legal.tsx';
import { Formats } from './components/Formats.tsx';
import { FormatPage } from './components/FormatPage.tsx';
import { Exercises } from './components/Exercises.tsx';
import { ExercisePage } from './components/ExercisePage.tsx';
import { PublicLayout } from './components/PublicLayout.tsx';
import { PlayerLayout } from './components/PlayerLayout.tsx';

export const router = createBrowserRouter([
  // Public pages — shared wrapper (min-h-screen bg-surface)
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'formats', element: <Formats /> },
      { path: 'formats/:slug', element: <FormatPage /> },
      { path: 'exercices', element: <Exercises /> },
      { path: 'exercices/:slug', element: <ExercisePage /> },
      { path: 'legal/:tab', element: <Legal /> },
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
