import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './index.css';
import './i18n';
import App from './App.tsx';
import { initAnalyticsAsync } from './lib/analytics.ts';
import { isNative } from './lib/capacitor.ts';
import { initSentryAsync } from './lib/sentryReport.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {!isNative() && <Analytics />}
  </StrictMode>,
);

// Defer Sentry + PostHog init past the first paint — see
// src/lib/sentryReport.ts and src/lib/analytics.ts. Both modules
// queue events from before init lands, then flush once the SDK is up.
initSentryAsync();
initAnalyticsAsync();
