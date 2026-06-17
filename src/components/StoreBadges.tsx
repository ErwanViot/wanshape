import { useTranslation } from 'react-i18next';
import { isNative } from '../lib/capacitor.ts';

const APP_STORE_URL = 'https://apps.apple.com/fr/app/wan2fit/id6766951336';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=fr.wansoft.wan2fit';

// Official store badges linking to the iOS + Android apps.
//
// Web-only: rendering "Download on the App Store / Get it on Google Play" inside
// the native shell itself is pointless, and cross-promoting another store from
// within an app is frowned upon by both stores' guidelines. The Footer only
// mounts on the public web layout, but we gate on isNative() defensively.
//
// The Apple lockup is transparent, so it needs to match the surface: the white
// lockup shows on the dark theme, the black lockup on the light theme. The swap
// is driven by `[data-theme]` in index.css (CSS-only → no hydration flash on the
// prerendered pages).
export function StoreBadges() {
  const { t } = useTranslation('marketing');
  if (isNative()) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('store_badges.app_store')}
        className="inline-block transition-opacity hover:opacity-80"
      >
        <img
          src="/images/badge-app-store-fr-white.svg"
          alt=""
          className="badge-theme-dark h-10 w-auto"
          width={127}
          height={40}
          loading="lazy"
        />
        <img
          src="/images/badge-app-store-fr-black.svg"
          alt=""
          className="badge-theme-light h-10 w-auto"
          width={127}
          height={40}
          loading="lazy"
        />
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('store_badges.google_play')}
        className="inline-block transition-opacity hover:opacity-80"
      >
        {/* Both lockups fill their canvas with only a few % of padding, so the
            same rendered height keeps the two badges visually balanced. */}
        <img
          src="/images/badge-google-play-fr.svg"
          alt=""
          className="h-10 w-auto"
          width={135}
          height={40}
          loading="lazy"
        />
      </a>
    </div>
  );
}
