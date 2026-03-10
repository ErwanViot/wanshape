import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { LoadingFallback } from '../LoadingFallback.tsx';

export function RequirePremium({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.subscription_tier !== 'premium') {
    return <Navigate to="/premium" replace />;
  }

  return <>{children}</>;
}
