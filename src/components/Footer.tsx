import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function Footer() {
  const { t } = useTranslation('marketing');

  return (
    <footer className="px-6 py-8 border-t border-divider">
      <p className="text-faint text-xs text-center">
        Wan2Fit {t('footer.by')}{' '}
        <a
          href="https://www.wan-soft.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-subtle underline transition-colors"
        >
          WAN SOFT
        </a>
      </p>
      <div className="mt-3 space-y-2">
        <div className="flex justify-center">
          <Link to="/a-propos" className="text-xs text-link hover:text-link-hover transition-colors">
            {t('footer.about')}
          </Link>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/legal/mentions" className="text-xs text-faint hover:text-subtle transition-colors">
            {t('footer.legal')}
          </Link>
          <Link to="/legal/privacy" className="text-xs text-faint hover:text-subtle transition-colors">
            {t('footer.privacy')}
          </Link>
          <Link to="/legal/cgu" className="text-xs text-faint hover:text-subtle transition-colors">
            {t('footer.cgu')}
          </Link>
          <Link to="/legal/cgv" className="text-xs text-faint hover:text-subtle transition-colors">
            {t('footer.cgv')}
          </Link>
          <a href="mailto:contact@wan2fit.fr" className="text-xs text-faint hover:text-subtle transition-colors">
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
