import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { LoadingFallback } from '../LoadingFallback.tsx';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
