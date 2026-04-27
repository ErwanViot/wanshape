import { useTranslation } from 'react-i18next';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';

export function AboutPage() {
  const { t } = useTranslation('marketing');

  useDocumentHead({
    title: t('about.page_title'),
    description: t('about.page_description'),
  });

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-10 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl font-black text-heading mb-8">{t('about.heading')}</h1>

      <div className="space-y-5 text-body leading-relaxed">
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>{t('about.p3')}</p>
        <p>{t('about.p4')}</p>
        <p>{t('about.p5')}</p>
      </div>

      {/* Signature */}
      <div className="mt-10 flex items-center gap-4">
        <img src="/photo-wan.webp" alt={t('about.signature_alt')} className="w-16 h-16 rounded-full object-cover" />
        <span className="text-subtle text-lg italic">{t('about.signature')}</span>
      </div>

      {/* Contact */}
      <p className="mt-8 text-subtle text-sm">
        {t('about.contact')}{' '}
        <a href="mailto:contact@wan2fit.fr" className="text-link hover:text-link-hover underline transition-colors">
          contact@wan2fit.fr
        </a>
      </p>
    </div>
  );
}
