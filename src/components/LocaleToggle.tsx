import { useTranslation } from 'react-i18next';

import { useLocale } from '../hooks/useLocale.ts';
import type { SupportedLocale } from '../i18n';

const PILLS: ReadonlyArray<{ code: SupportedLocale; label: string; longLabelKey: string }> = [
  { code: 'fr', label: 'FR', longLabelKey: 'language_switcher.option_fr' },
  { code: 'en', label: 'EN', longLabelKey: 'language_switcher.option_en' },
];

export function LocaleToggle() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <fieldset className="inline-flex rounded-lg border border-divider bg-card-bg p-0.5 m-0">
      <legend className="sr-only">{t('language_switcher.aria_label')}</legend>
      {PILLS.map(({ code, label, longLabelKey }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={t(longLabelKey)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              active ? 'bg-brand/10 text-brand' : 'text-muted hover:text-heading'
            }`}
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}
