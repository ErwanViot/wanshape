import { Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface SessionNotFoundProps {
  linkTo?: string;
  linkLabel?: string;
}

export function SessionNotFound({ linkTo = '/', linkLabel }: SessionNotFoundProps) {
  const { t } = useTranslation('player');
  const resolvedLabel = linkLabel ?? t('session_not_found.back_home');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center">
        <Moon className="w-12 h-12 text-white/40 mb-4 mx-auto" aria-hidden="true" />
        <p className="text-white/60 text-lg font-medium">{t('session_not_found.message')}</p>
        <Link to={linkTo} className="text-link hover:text-link-hover underline mt-4 inline-block">
          {resolvedLabel}
        </Link>
      </div>
    </div>
  );
}
