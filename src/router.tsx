import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { Home } from './components/Home.tsx';
import { PlayerPage } from './components/Player.tsx';
import { Legal } from './components/Legal.tsx';
import { Formats } from './components/Formats.tsx';
import { FormatPage } from './components/FormatPage.tsx';
import { Exercises } from './components/Exercises.tsx';
import { ExercisePage } from './components/ExercisePage.tsx';
import { Layout } from './components/Layout.tsx';

function SessionRedirect() {
  const { dateKey } = useParams();
  return <Navigate to={`/seance/${dateKey}/play`} replace />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'seance/:dateKey', element: <SessionRedirect /> },
      { path: 'seance/:dateKey/play', element: <PlayerPage /> },
      { path: 'formats', element: <Formats /> },
      { path: 'formats/:slug', element: <FormatPage /> },
      { path: 'exercices', element: <Exercises /> },
      { path: 'exercices/:slug', element: <ExercisePage /> },
      { path: 'legal/:tab', element: <Legal /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
