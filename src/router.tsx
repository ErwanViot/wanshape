import { createBrowserRouter, Navigate } from 'react-router';
import { Home } from './components/Home.tsx';
import { PlayerPage } from './components/Player.tsx';
import { Legal } from './components/Legal.tsx';
import { Formats } from './components/Formats.tsx';
import { FormatPage } from './components/FormatPage.tsx';
import { Exercises } from './components/Exercises.tsx';
import { ExercisePage } from './components/ExercisePage.tsx';
import { Layout } from './components/Layout.tsx';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'seance/play', element: <PlayerPage /> },
      // Legacy URLs with date → redirect to dateless route
      { path: 'seance/:dateKey/play', element: <Navigate to="/seance/play" replace /> },
      { path: 'seance/:dateKey', element: <Navigate to="/seance/play" replace /> },
      { path: 'formats', element: <Formats /> },
      { path: 'formats/:slug', element: <FormatPage /> },
      { path: 'exercices', element: <Exercises /> },
      { path: 'exercices/:slug', element: <ExercisePage /> },
      { path: 'legal/:tab', element: <Legal /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
