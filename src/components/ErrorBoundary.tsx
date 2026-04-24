import * as Sentry from '@sentry/react';
import { Component, type ReactNode } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-heading mb-4">{t('error_boundary.title')}</h1>
            <p className="text-body mb-6">{t('error_boundary.body')}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="cta-gradient px-6 py-3 rounded-xl font-semibold"
            >
              {t('error_boundary.back_home')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation('common')(ErrorBoundaryBase);
