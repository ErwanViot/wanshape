import * as Sentry from '@sentry/react';
import type { ReactNode } from 'react';
import { Component } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface Props {
  children: ReactNode;
  backTo?: string;
}

interface State {
  hasError: boolean;
}

// Standalone function component so we can use the useTranslation hook.
// Class components cannot call hooks directly; rendering a function component
// from the class's render() method is the standard workaround.
function ErrorFallback({ backTo }: { backTo: string }) {
  const { t } = useTranslation('player');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-white/60 text-lg font-medium mb-2">{t('error_boundary.message')}</p>
        <p className="text-white/40 text-sm mb-6">{t('error_boundary.detail')}</p>
        <Link to={backTo} className="px-6 py-3 rounded-xl bg-white text-black font-semibold inline-block">
          {t('error_boundary.back_button')}
        </Link>
      </div>
    </div>
  );
}

export class PlayerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      const backTo = this.props.backTo ?? '/';
      return <ErrorFallback backTo={backTo} />;
    }
    return this.props.children;
  }
}
