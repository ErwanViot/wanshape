import { AlertTriangle, CheckCircle, ChevronLeft, Clock, Lightbulb, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router';
import { getFormatBySlug } from '../data/formats.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { ContentSection } from './ContentSection.tsx';

export function FormatPage() {
  const { t } = useTranslation('explore');
  const { t: td } = useTranslation('formats_data');
  const { slug } = useParams<{ slug: string }>();
  const format = slug ? getFormatBySlug(slug) : undefined;

  useDocumentHead({
    title: format
      ? t('format_page_meta.doc_title', { name: td(`${format.slug}.name`) })
      : t('format_page_meta.doc_title_fallback'),
    description: format
      ? t('format_page_meta.doc_description', {
          name: td(`${format.slug}.name`),
          short: td(`${format.slug}.shortDescription`),
        })
      : undefined,
  });

  if (!format) {
    return <Navigate to="/formats" replace />;
  }

  const benefits = td(`${format.slug}.benefits`, { returnObjects: true }) as string[];
  const tips = td(`${format.slug}.tips`, { returnObjects: true }) as string[];
  const commonMistakes = td(`${format.slug}.commonMistakes`, { returnObjects: true }) as string[];

  return (
    <>
      {/* Hero — text stays white (over image) */}
      <div className="relative">
        <div className="h-48 sm:h-56 overflow-hidden">
          <img
            src={format.image}
            alt={t('format_page.img_alt', { name: td(`${format.slug}.name`) })}
            className="w-full h-full object-cover object-[50%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-surface/20" />
        </div>

        <Link
          to="/formats"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label={t('format_page.back_aria')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-black text-white drop-shadow-sm leading-tight">
                {td(`${format.slug}.name`)}
              </h1>
              <p className="text-sm text-white/60 mt-1">{td(`${format.slug}.subtitle`)}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {format.duration} min
              </span>
              <div
                className="flex items-center gap-1"
                role="img"
                aria-label={t('format_page.intensity_aria', { n: format.intensity })}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`intensity-dot ${i <= format.intensity ? 'active' : 'inactive'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <p className="text-base text-body leading-relaxed">{td(`${format.slug}.shortDescription`)}</p>

        {/* Principe */}
        <ContentSection
          title={t('format_page.section_principle')}
          icon={<Lightbulb className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <p className="text-sm text-subtle leading-relaxed">{td(`${format.slug}.principle`)}</p>
        </ContentSection>

        {/* Protocole */}
        <ContentSection
          title={t('format_page.section_protocol')}
          icon={<Clock className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <p className="text-sm text-subtle leading-relaxed">{td(`${format.slug}.protocol`)}</p>
        </ContentSection>

        {/* Bénéfices */}
        <ContentSection
          title={t('format_page.section_benefits')}
          icon={<CheckCircle className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <ul className="space-y-2">
            {benefits.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-link shrink-0 mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Public cible */}
        <ContentSection
          title={t('format_page.section_audience')}
          icon={<Users className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <p className="text-sm text-subtle leading-relaxed">{td(`${format.slug}.targetAudience`)}</p>
        </ContentSection>

        {/* Conseils */}
        <ContentSection
          title={t('format_page.section_tips')}
          icon={<Lightbulb className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Erreurs courantes */}
        <ContentSection
          title={t('format_page.section_mistakes')}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />}
        >
          <ul className="space-y-2">
            {commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Cross-links */}
        <div className="pt-4 border-t border-divider space-y-3">
          <div className="flex flex-wrap gap-3">
            <Link to="/exercices" className="text-sm text-link hover:text-link-hover transition-colors">
              {t('format_page.link_exercises')}
            </Link>
            <Link to="/programmes" className="text-sm text-link hover:text-link-hover transition-colors">
              {t('format_page.link_programs')}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <Link
              to="/formats"
              className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('format_page.all_formats')}
            </Link>
            <Link to="/" className="text-sm text-link hover:text-link-hover transition-colors">
              {t('format_page.today_session')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
