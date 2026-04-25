import * as Sentry from '@sentry/react';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

// Strip identifiers (UUIDs, ISO date keys YYYYMMDD with year 19xx-20xx) from
// URL paths so user/session IDs don't end up in Sentry transaction names,
// fetch breadcrumbs, or span descriptions. Year prefix guards against matching
// arbitrary 8-digit numeric IDs in unrelated paths.
function scrubPathIds(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':uuid')
    .replace(/\/(?:19|20)\d{6}(?=\/|$|\?|#)/g, '/:date');
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // RGPD art. 9: nutrition logs, injury declarations, calorie targets,
      // AI coach notes and email inputs all qualify as health/personal data.
      // Mask both form inputs AND rendered text nodes, block media, and keep
      // the network detail allowlist empty so request/response bodies aren't
      // captured in error replays.
      maskAllInputs: true,
      maskAllText: true,
      blockAllMedia: true,
      networkDetailAllowUrls: [],
    }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  beforeBreadcrumb(breadcrumb) {
    // Default fetch/xhr breadcrumbs include full URLs with Supabase UUID
    // query params. Scrub before they reach the wire.
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      if (typeof breadcrumb.data?.url === 'string') {
        breadcrumb.data.url = scrubPathIds(breadcrumb.data.url);
      }
    }
    return breadcrumb;
  },
  beforeSend(event) {
    // Error events carry window.location.href in event.request.url via the
    // HttpContext integration; routes like /seance/custom/<uuid> would leak
    // the session id otherwise.
    if (event.request?.url) event.request.url = scrubPathIds(event.request.url);
    return event;
  },
  beforeSendTransaction(event) {
    if (event.transaction) event.transaction = scrubPathIds(event.transaction);
    // Each browser-tracing span carries the full fetch URL in `description`.
    if (event.spans) {
      for (const span of event.spans) {
        if (span.description) span.description = scrubPathIds(span.description);
      }
    }
    return event;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
