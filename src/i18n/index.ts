import i18n, { type Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = 'wan2fit-locale';
const DEFAULT_LOCALE: SupportedLocale = 'fr';

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// All translation modules — Vite turns each path into its own chunk
// because the glob is non-eager. The detected locale is preloaded
// synchronously below; the alternate locale is fetched on demand by
// the resources-to-backend plugin if the user switches language.
const modules = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json');

function detectInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) return stored;
  } catch {
    // Storage may be disabled (private browsing, ITP); fall through.
  }
  const navLang = navigator.language?.slice(0, 2);
  if (navLang && isSupportedLocale(navLang)) return navLang;
  return DEFAULT_LOCALE;
}

const initialLocale = detectInitialLocale();

// Eagerly fetch every namespace for the detected locale — this is the
// only locale needed for first paint. Top-level await ships fine with
// the bundler config (Vite + ESM target). Each JSON file becomes its
// own chunk; the browser fetches them in parallel from a single
// modulepreload chain.
const initialResources: Resource = { [initialLocale]: {} };
const namespaceSet = new Set<string>();

await Promise.all(
  Object.entries(modules).map(async ([path, loader]) => {
    const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (!match) return;
    const [, locale, namespace] = match;
    namespaceSet.add(namespace);
    if (locale !== initialLocale) return;
    const mod = await loader();
    initialResources[locale][namespace] = mod.default;
  }),
);

const namespaces = Array.from(namespaceSet);

i18n
  .use(LanguageDetector)
  // Backend that resolves missing namespaces (typically the alternate
  // locale after a /settings switch) by deferring to the same Vite
  // glob. Returns a promise so i18next waits for the chunk to land.
  .use(
    resourcesToBackend((locale: string, namespace: string) => {
      const path = `./locales/${locale}/${namespace}.json`;
      const loader = modules[path];
      if (!loader) return Promise.resolve({});
      return loader().then((mod) => mod.default);
    }),
  )
  .use(initReactI18next)
  .init({
    resources: initialResources,
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    ns: namespaces,
    defaultNS: 'common',
    // partialBundledLanguages: true tells i18next that initialResources
    // is intentionally incomplete — the backend will fill in the rest
    // for languages we don't ship at boot.
    partialBundledLanguages: true,
    // Escape interpolated values by default (XSS safety). Strings that need
    // intentional HTML (e.g. <strong>...</strong>) must be rendered with
    // react-i18next's <Trans> component and an explicit `components` map —
    // never with dangerouslySetInnerHTML.
    interpolation: { escapeValue: true },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    returnNull: false,
    react: {
      // Suspense kicks in only when the user switches language and the
      // alternate locale's namespaces are still loading.
      useSuspense: true,
    },
  });

const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = isSupportedLocale(lng) ? lng : DEFAULT_LOCALE;
};

syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
