import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
