import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FORMATS_DATA } from '../data/formats.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';

export function Formats() {
  const { t } = useTranslation('explore');
  const { t: td } = useTranslation('formats_data');
  useDocumentHead({
    title: t('formats.page_title'),
    description: t('formats.page_description'),
  });

  return (
    <>
      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-1 -ml-1 text-muted hover:text-strong transition-colors"
            aria-label={t('formats.back_aria')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-lg text-heading">{t('formats.heading')}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p
          className="text-sm text-subtle leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: translated HTML with bold tag
          dangerouslySetInnerHTML={{ __html: t('formats.intro') }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORMATS_DATA.map((format) => (
            <Link
              key={format.type}
              to={`/formats/${format.slug}`}
              className="format-card rounded-2xl overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
            >
              {/* Image — text stays white (over image) */}
              <div className="relative h-28 overflow-hidden">
                <img
                  src={format.image}
                  alt={t('formats.img_alt', { name: td(`${format.slug}.name`) })}
                  className="w-full h-full object-cover object-[50%_30%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h2 className="font-bold text-white text-base drop-shadow-sm">{td(`${format.slug}.name`)}</h2>
                    <p className="text-xs text-white/60">{td(`${format.slug}.subtitle`)}</p>
                  </div>
                  <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full shrink-0">
                    {format.duration} min
                  </span>
                </div>
              </div>

              {/* Content (below image) */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Intensity dots */}
                <div
                  className="flex items-center gap-1.5"
                  role="img"
                  aria-label={t('formats.intensity_aria', { n: format.intensity })}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`intensity-dot ${i <= format.intensity ? 'active' : 'inactive'}`} />
                  ))}
                </div>

                <p className="text-[13px] text-subtle leading-relaxed flex-1">
                  {td(`${format.slug}.card_description`)}
                </p>

                <p className="text-xs text-link font-medium leading-relaxed">{td(`${format.slug}.card_benefit`)}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-faint text-center leading-relaxed">{t('formats.footer_note')}</p>
      </div>
    </>
  );
}
