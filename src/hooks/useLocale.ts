import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { isSupportedLocale, type SupportedLocale } from '../i18n';
import { twinPath } from '../utils/localePath.ts';

export function useLocale() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rawLocale = i18n.resolvedLanguage ?? i18n.language;
  const locale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : 'fr';

  // For URLs whose path itself is localised (acquisition landings, recipe
  // listing), navigate to the twin in the target locale before switching
  // i18n. Without this, an effect bound to pathname (e.g. in
  // FeatureLandingTemplate) would snap the language back to whatever the
  // URL implies. For non-mirrored URLs, we just change the language.
  const setLocale = (next: SupportedLocale) => {
    if (next === locale) return;
    const twin = twinPath(pathname, next);
    if (twin) navigate(twin, { replace: true });
    void i18n.changeLanguage(next);
  };

  return { locale, setLocale } as const;
}
