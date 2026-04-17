import * as Sentry from '@sentry/react';
import type { ReactNode } from 'react';
import { Component } from 'react';
import { Link } from 'react-router';

interface Props {
  children: ReactNode;
  backTo?: string;
}

interface State {
  hasError: boolean;
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
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-white/60 text-lg font-medium mb-2">Une erreur est survenue pendant la séance.</p>
            <p className="text-white/40 text-sm mb-6">La séance n'a pas pu être affichée correctement.</p>
            <Link to={backTo} className="px-6 py-3 rounded-xl bg-white text-black font-semibold inline-block">
              Retour
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
