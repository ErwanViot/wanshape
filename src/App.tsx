import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { router } from './router.tsx';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
