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
let sentryLoading: Promise<SentrySdk> | null = null;
const queue: QueuedReport[] = [];

async function loadSentry(): Promise<SentrySdk> {
  if (sentryModule) return sentryModule;
  if (!sentryLoading) {
    // Pick the right SDK at the moment of the import. The Capacitor
    // global is set synchronously when Capacitor's WebView boots, so by
    // the time captureException / initSentryAsync runs (post-render or
    // post-error) it's already known.
    const { isNative } = await import('./capacitor.ts');
    sentryLoading = isNative()
      ? (import('@sentry/capacitor') as unknown as Promise<SentrySdk>)
      : (import('@sentry/react') as unknown as Promise<SentrySdk>);
  }
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

// Shared options used by both the web init and the Capacitor sibling
// init. Keeping them in one place ensures the WebView portion of the
// native app gets the same RGPD masking + URL scrubbing as the PWA.
function buildBrowserOptions(): Record<string, unknown> {
  return {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
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
  const SentryCapacitor = await import('@sentry/capacitor');
  const SentryReact = await import('@sentry/react');
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
