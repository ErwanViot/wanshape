import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { LoadingFallback } from '../LoadingFallback.tsx';
import { UpgradePrompt } from '../UpgradePrompt.tsx';

export function RequirePremium({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.subscription_tier !== 'premium') {
    return <>{fallback ?? <UpgradePrompt />}</>;
  }

  return <>{children}</>;
}
