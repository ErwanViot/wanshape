import { useTranslation } from 'react-i18next';
import type { Session } from '../types/session.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';

const COLORS: Record<string, string> = {
  accessible: 'text-emerald-400',
  modere: 'text-amber-400',
  intense: 'text-red-400',
};

export function DifficultyBadge({ session, separator = true }: { session: Session; separator?: boolean }) {
  const { t } = useTranslation('common');
  const difficulty = computeDifficulty(session);
  return (
    <>
      {separator && <span className="text-xs text-white/70">·</span>}
      <span className={`text-xs font-semibold ${COLORS[difficulty.level]}`}>{t(`difficulty.${difficulty.level}`)}</span>
    </>
  );
}
