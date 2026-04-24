import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LOCALES, type SupportedLocale } from '../i18n';

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function useLocale() {
  const { i18n } = useTranslation();
  const rawLocale = i18n.resolvedLanguage ?? i18n.language;
  const locale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : 'fr';

  const setLocale = useCallback(
    (next: SupportedLocale) => {
      if (next === locale) return;
      void i18n.changeLanguage(next);
    },
    [i18n, locale],
  );

  return { locale, setLocale, supportedLocales: SUPPORTED_LOCALES } as const;
}
