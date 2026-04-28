// Lazy-loaded Sentry reporter. The @sentry/react bundle is ~88 KB gzipped;
// loading it eagerly puts that on the critical-path JS budget for every
// first paint. This wrapper defers the import until either:
//   - an error is reported (captureException), or
//   - the deferred init runs after the first paint (initSentryAsync).
// Errors raised before the bundle finishes loading queue up and flush
// once Sentry is ready.

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

let sentryModule: typeof import('@sentry/react') | null = null;
let sentryLoading: Promise<typeof import('@sentry/react')> | null = null;
const queue: QueuedReport[] = [];

async function loadSentry(): Promise<typeof import('@sentry/react')> {
  if (sentryModule) return sentryModule;
  if (!sentryLoading) sentryLoading = import('@sentry/react');
  sentryModule = await sentryLoading;
  return sentryModule;
}

export function captureException(error: unknown, context?: CaptureContext): void {
  if (!import.meta.env.PROD) return;
  if (sentryModule) {
    sentryModule.captureException(error, context as Parameters<typeof sentryModule.captureException>[1]);
    return;
  }
  // Hold the error until the bundle resolves; the load was likely already
  // kicked off by initSentryAsync, so this just hops to the end of the
  // microtask queue when it lands.
  queue.push({ error, context });
  loadSentry()
    .then((Sentry) => {
      while (queue.length) {
        const { error: err, context: ctx } = queue.shift()!;
        Sentry.captureException(err, ctx as Parameters<typeof Sentry.captureException>[1]);
      }
    })
    .catch(() => {
      // Sentry bundle failed to load — drop the queued errors silently.
      // Reporting the loader failure to Sentry would obviously not help.
      queue.length = 0;
    });
}

// URL identifier scrubbing — kept here so initSentryAsync can pass it to
// Sentry.init beforeBreadcrumb / beforeSend / beforeSendTransaction. Year
// prefix in the date regex guards against matching arbitrary 8-digit
// numeric IDs in unrelated paths. The OFF barcode rule is anchored to the
// /product/<8-14 digits> path so we don't strip unrelated numeric segments;
// it keeps the diagnostic signal (an OFF lookup failed) without leaking the
// EAN which links to dietary choices (RGPD art. 9).
function scrubPathIds(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':uuid')
    .replace(/\/(?:19|20)\d{6}(?=\/|$|\?|#)/g, '/:date')
    .replace(/\/product\/\d{8,14}(?=\/|$|\?|#)/g, '/product/:barcode');
}

export function initSentryAsync(): void {
  if (!import.meta.env.PROD) return;
  // Defer the import past the first paint. requestIdleCallback isn't
  // implemented on Safari < 16.4; fall back to a small setTimeout — both
  // schedules run after the LCP frame.
  const start = () => {
    loadSentry().then((Sentry) => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        enabled: import.meta.env.PROD,
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
        tracesSampleRate: 0.2,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        beforeBreadcrumb(breadcrumb) {
          if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
            if (typeof breadcrumb.data?.url === 'string') {
              breadcrumb.data.url = scrubPathIds(breadcrumb.data.url);
            }
          }
          return breadcrumb;
        },
        beforeSend(event) {
          if (event.request?.url) event.request.url = scrubPathIds(event.request.url);
          return event;
        },
        beforeSendTransaction(event) {
          if (event.transaction) event.transaction = scrubPathIds(event.transaction);
          if (event.spans) {
            for (const span of event.spans) {
              if (span.description) span.description = scrubPathIds(span.description);
            }
          }
          return event;
        },
      });
    });
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 0);
  }
}
