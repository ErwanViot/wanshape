// Lazy-loaded Sentry reporter. The @sentry/react bundle is ~88 KB gzipped;
// loading it eagerly puts that on the critical-path JS budget for every
// first paint. This wrapper defers the import until either:
//   - an error is reported (captureException), or
//   - the deferred init runs after the first paint (initSentryAsync).
// Errors raised before the bundle finishes loading queue up and flush
// once Sentry is ready.
//
// Native bridging — when the app runs inside Capacitor (iOS WKWebView /
// Android WebView), the JS side alone misses native crashes (Swift
// exceptions, JNI faults, OOM kills). @sentry/capacitor wraps the native
// SDKs (Sentry-Cocoa / Sentry-Android) and forwards those events to the
// same DSN. We init the Capacitor wrapper instead of the React-only
// SDK on native, then pass SentryReact.init as a sibling so all the
// browser features (replay, browser tracing, scrub callbacks) still
// run for the JS portion of the WebView.

import { scrubPathIds } from './scrub.ts';

// Mirror the second arg shape of Sentry.captureException without dragging
// the full @sentry/* types into the synchronously-loaded bundle. The
// runtime accepts ScopeContext / EventHint / scope-callback shapes; we
// only ever pass a `{ contexts: { ... } }` ScopeContext from the error
// boundaries, so this minimal shape is all we need.
type CaptureContext = {
  contexts?: Record<string, Record<string, unknown>>;
};

interface QueuedReport {
  error: unknown;
  context?: CaptureContext;
}

// Both @sentry/capacitor and @sentry/react re-export the same
// captureException / captureMessage signatures, so a single typed
// reference covers both modules at the call site.
type SentrySdk = {
  captureException: typeof import('@sentry/react').captureException;
  captureMessage: typeof import('@sentry/react').captureMessage;
};

let sentryModule: SentrySdk | null = null;
const queue: QueuedReport[] = [];

export function captureException(error: unknown, context?: CaptureContext): void {
  if (!import.meta.env.PROD) return;
  if (sentryModule) {
    sentryModule.captureException(error, context as Parameters<typeof sentryModule.captureException>[1]);
    return;
  }
  // Sentry hasn't booted yet — hold the report until initSentryAsync()
  // resolves and flushes the queue. We deliberately do NOT trigger an
  // ad-hoc dynamic import here: the load step alone gives us the SDK
  // module without ever calling Sentry.init(), and reporting against
  // an uninitialised SDK is a silent no-op that swallows the event.
  queue.push({ error, context });
}

// Shared options used by both the web init and the Capacitor sibling
// init. Keeping them in one place ensures the WebView portion of the
// native app gets the same RGPD masking + URL scrubbing as the PWA.
// Replay-related options are intentionally NOT included here — the
// native SDK has no replay product and would silently ignore them,
// and we deliberately keep replay web-only for RGPD reasons (art. 9
// data is plentiful in the WebView views).
function buildBrowserOptions(): Record<string, unknown> {
  return {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    tracesSampleRate: 0.2,
    beforeBreadcrumb(breadcrumb: { category?: string; data?: Record<string, unknown> }) {
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (typeof breadcrumb.data?.url === 'string') {
          breadcrumb.data.url = scrubPathIds(breadcrumb.data.url);
        }
      }
      return breadcrumb;
    },
    beforeSend(event: { request?: { url?: string } }) {
      if (event.request?.url) event.request.url = scrubPathIds(event.request.url);
      return event;
    },
    beforeSendTransaction(event: { transaction?: string; spans?: Array<{ description?: string }> }) {
      if (event.transaction) event.transaction = scrubPathIds(event.transaction);
      if (event.spans) {
        for (const span of event.spans) {
          if (span.description) span.description = scrubPathIds(span.description);
        }
      }
      return event;
    },
  };
}

async function initWeb(): Promise<SentrySdk> {
  const Sentry = await import('@sentry/react');
  Sentry.init({
    ...buildBrowserOptions(),
    // Replay sampling stays in the web init only — these options are
    // meaningless for the native SDK.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // RGPD art. 9: nutrition logs, injury declarations, calorie
        // targets, AI coach notes and email inputs all qualify as
        // health/personal data. Mask both inputs and rendered text,
        // block media, and keep the network detail allowlist empty.
        maskAllInputs: true,
        maskAllText: true,
        blockAllMedia: true,
        networkDetailAllowUrls: [],
      }),
    ],
  } as Parameters<typeof Sentry.init>[0]);
  return Sentry;
}

async function initNative(): Promise<SentrySdk> {
  // Parallel chunk fetch: the two SDKs are independent, no need to
  // wait for the @sentry/capacitor chunk before starting the
  // @sentry/react one. Saves ~30-50% on cold-launch Sentry init time
  // on slow networks.
  const [SentryCapacitor, SentryReact] = await Promise.all([import('@sentry/capacitor'), import('@sentry/react')]);
  SentryCapacitor.init(
    {
      ...buildBrowserOptions(),
      // The native SDK has its own auto session tracking + crash
      // handlers; replay is web-only so it stays out of the Capacitor
      // options block. browserTracing still belongs to the React side.
    } as Parameters<typeof SentryCapacitor.init>[0],
    SentryReact.init,
  );
  return SentryCapacitor;
}

export function initSentryAsync(): void {
  if (!import.meta.env.PROD) return;
  // Defer the import past the first paint. requestIdleCallback isn't
  // implemented on Safari < 16.4; fall back to a small setTimeout — both
  // schedules run after the LCP frame.
  const start = async () => {
    try {
      const { isNative } = await import('./capacitor.ts');
      const Sentry = await (isNative() ? initNative() : initWeb());
      sentryModule = Sentry;
      // Flush whatever queued up before init completed.
      while (queue.length) {
        const { error: err, context: ctx } = queue.shift()!;
        Sentry.captureException(err, ctx as Parameters<typeof Sentry.captureException>[1]);
      }
      // One-shot per-session boot probe. Low-traffic prod can spend hours
      // with zero errors and zero sampled transactions, making a silent
      // init failure indistinguishable from "no events to report". This
      // gives us a heartbeat per session so dashboard absence == real
      // breakage. Gated on sessionStorage to keep the cost bounded.
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('sentry_boot')) {
        sessionStorage.setItem('sentry_boot', '1');
        Sentry.captureMessage('sentry-boot', 'info');
      }
    } catch (err) {
      // Dynamic import or Sentry.init failure (chunk 404, network drop,
      // blocked by an extension, native bridge unavailable).
      // eslint-disable-next-line no-console
      console.warn('[sentry] init failed', err);
    }
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        void start();
      },
      { timeout: 2000 },
    );
  } else {
    setTimeout(() => {
      void start();
    }, 0);
  }
}
