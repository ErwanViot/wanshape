import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './index.css';
import './i18n';
import App from './App.tsx';
import { initSentryAsync } from './lib/sentryReport.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);

// Defer Sentry init past the first paint — see src/lib/sentryReport.ts.
// Errors thrown during the React boot before init runs are queued via
// the captureException wrapper used by both ErrorBoundary classes.
initSentryAsync();
