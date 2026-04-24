import { useTranslation } from 'react-i18next';
import type { Session } from '../../types/session.ts';
import { computeDifficulty } from '../../utils/sessionDifficulty.ts';
import { getSessionImage } from '../../utils/sessionImage.ts';
import { SessionAccordion } from '../SessionAccordion.tsx';

export function TomorrowCard({
  session,
  dateKey,
  formatShortDate,
}: {
  session: Session;
  dateKey: string;
  formatShortDate: (key: string) => string;
}) {
  const { t } = useTranslation(['home', 'common']);
  const image = getSessionImage(session);
  const difficulty = computeDifficulty(session);

  return (
    <div className="rounded-2xl overflow-hidden border border-card-border">
      {/* Compact header */}
      <div className="flex items-stretch min-h-[100px]">
        {/* Thumbnail */}
        <div className="relative w-28 sm:w-36 shrink-0">
          <img
            src={image}
            alt={t('tomorrow.session_alt', { title: session.title })}
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="session-label-tomorrow px-2 py-0.5 rounded-md">
              <span className="text-xs font-bold text-white">{t('tomorrow.label')}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0 bg-surface-card">
          <p className="text-xs text-muted mb-1">{formatShortDate(dateKey)}</p>
          <h3 className="font-display text-base font-bold text-heading truncate">{session.title.toUpperCase()}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted">
              {t('tomorrow.duration', { duration: session.estimatedDuration })}
            </span>
            <span className="text-xs text-muted">·</span>
            <span
              className={`text-xs font-semibold ${
                difficulty.level === 'accessible'
                  ? 'text-emerald-400'
                  : difficulty.level === 'modere'
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {t(`common:difficulty.${difficulty.level}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu détaillé */}
      <SessionAccordion session={session} />
    </div>
  );
}
