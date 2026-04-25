import i18n, { type Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = 'wan2fit-locale';
const DEFAULT_LOCALE: SupportedLocale = 'fr';

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// Eagerly load every namespace JSON file so the app has full translations from first render.
// Path shape: ./locales/<locale>/<namespace>.json
const modules = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json', {
  eager: true,
});

const resources: Resource = {};
const namespaceSet = new Set<string>();

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, locale, namespace] = match;
  if (!isSupportedLocale(locale)) continue;
  namespaceSet.add(namespace);
  resources[locale] ??= {};
  resources[locale][namespace] = mod.default;
}

const namespaces = Array.from(namespaceSet);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    ns: namespaces,
    defaultNS: 'common',
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
  });

const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = isSupportedLocale(lng) ? lng : DEFAULT_LOCALE;
};

syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
