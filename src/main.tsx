import * as Sentry from '@sentry/react';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

// Strip identifiers (UUIDs, YYYYMMDD date keys) from URL paths so user/session
// IDs don't end up in Sentry transaction names, breadcrumbs, or request URLs.
function scrubPathIds(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':uuid')
    .replace(/\/\d{8}(?=\/|$|\?)/g, '/:date');
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // RGPD art. 9: nutrition logs, injury declarations, and email inputs
      // qualify as health/personal data. Mask all form inputs and keep the
      // network detail allowlist empty so request/response bodies aren't
      // captured in error replays.
      maskAllInputs: true,
      networkDetailAllowUrls: [],
    }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  beforeSendTransaction(event) {
    if (event.transaction) event.transaction = scrubPathIds(event.transaction);
    if (event.request?.url) event.request.url = scrubPathIds(event.request.url);
    return event;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
