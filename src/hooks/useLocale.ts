import { useTranslation } from 'react-i18next';

import { isSupportedLocale, type SupportedLocale } from '../i18n';

export function useLocale() {
  const { i18n } = useTranslation();
  const rawLocale = i18n.resolvedLanguage ?? i18n.language;
  const locale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : 'fr';

  const setLocale = (next: SupportedLocale) => {
    if (next === locale) return;
    void i18n.changeLanguage(next);
  };

  return { locale, setLocale } as const;
}
