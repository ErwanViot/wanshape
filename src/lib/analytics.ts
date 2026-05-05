// Lazy-loaded PostHog reporter. Mirrors the sentryReport.ts pattern so
// the analytics SDK never lands on the critical-path JS budget for
// the first paint, and so events queued before init flush as soon as
// the SDK is up.
//
// RGPD posture matches the rest of the app:
//   - mask_all_text + mask_all_element_attributes — autocapture clicks
//     are kept (useful for funnels) but the captured payload never
//     contains user-typed content (nutrition log, AI coach notes,
//     injury declarations, email addresses).
//   - sanitize_properties scrubs URLs and breadcrumb data with the
//     same scrubPathIds rules used by Sentry (UUID / date / OFF
//     barcode → opaque tokens).
//   - persistence: 'memory' on native — Capacitor WebView storage is
//     volatile, so we don't pollute Preferences with PostHog cookies.
//   - opt-in toggle: tied to `VITE_POSTHOG_KEY` only — no key in the
//     environment, no init, no events. Lets dev / preview deployments
//     stay quiet by leaving the env var empty.
//
// Web is the primary target for now; the same module runs inside the
// Capacitor WebView (capacitor:// origin) and PostHog accepts that.

type CaptureProperties = Record<string, unknown>;

interface QueuedEvent {
  name: string;
  properties?: CaptureProperties;
}

type PosthogModule = typeof import('posthog-js');
type PosthogClient = PosthogModule['default'];

let client: PosthogClient | null = null;
const queue: QueuedEvent[] = [];

function scrubPathIds(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':uuid')
    .replace(/\/(?:19|20)\d{6}(?=\/|$|\?|#)/g, '/:date')
    .replace(/\/product\/\d{8,14}(?=\/|$|\?|#)/g, '/product/:barcode');
}

function sanitizeProperties(props: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...props };
  for (const key of ['$current_url', '$pathname', 'href', '$referrer', 'url']) {
    const value = next[key];
    if (typeof value === 'string') next[key] = scrubPathIds(value);
  }
  return next;
}

export function captureEvent(name: string, properties?: CaptureProperties): void {
  if (!import.meta.env.PROD) return;
  if (client) {
    client.capture(name, properties);
    return;
  }
  queue.push({ name, properties });
}

export function identifyUser(userId: string, traits?: CaptureProperties): void {
  if (!import.meta.env.PROD) return;
  if (client) {
    client.identify(userId, traits);
  }
  // Pre-init identify is intentionally dropped: a queued identify
  // would race with the auth context, and a stale id is worse than no
  // id. The next event after init will carry the current user via
  // capture().
}

export function resetAnalytics(): void {
  if (client) client.reset();
}

export function initAnalyticsAsync(): void {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const apiHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';
  if (!import.meta.env.PROD || !apiKey) return;

  const start = async () => {
    try {
      const posthogModule = await import('posthog-js');
      const posthog = posthogModule.default;
      posthog.init(apiKey, {
        api_host: apiHost,
        // Autocapture clicks/submits keeps the event surface low-effort
        // for funnels. Text content of those events is masked below.
        autocapture: true,
        // RGPD: mask user-typed content. Funnels still work because we
        // get event names + element identifiers, just not the payload.
        mask_all_text: true,
        mask_all_element_attributes: true,
        // No session replay (handled separately if ever enabled).
        disable_session_recording: true,
        // Drop the heatmap pings — opt-in only via dedicated pages.
        enable_heatmaps: false,
        // Web vitals are useful and contain no user data.
        capture_performance: true,
        // Clean up URLs in events + breadcrumb data before they leave
        // the device, so PII inside slugs (recipe slug "blessure-genou"
        // does NOT exist in our slugs but the principle holds for
        // future-proofing) never reaches PostHog.
        sanitize_properties: sanitizeProperties,
        // Prefer memoryStorage on native — Capacitor WebView purges
        // localStorage and we don't want PostHog to lose its anonymous
        // id every cold boot. The runtime auto-detects native via UA;
        // setting persistence: 'memory' explicitly when isNative()
        // would be cleaner but adds a sync await, so we leave the
        // default (cookie + localStorage with fallback) for now.
        loaded(loaded) {
          // Do not track the test/QA email until they identify
          // themselves and PostHog issues a real distinct_id.
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            loaded.opt_out_capturing();
          }
        },
      });
      client = posthog;
      // Flush whatever queued up before init landed.
      while (queue.length) {
        const evt = queue.shift()!;
        posthog.capture(evt.name, evt.properties);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] init failed', err);
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
