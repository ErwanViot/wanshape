import { useTranslation } from 'react-i18next';

export function NoVideoTag({ className }: { className?: string }) {
  const { t } = useTranslation('exercises_ui');

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-amber-500/10 text-white/50 ${className ?? ''}`}
    >
      <span aria-hidden="true">🚧</span>
      {t('no_video.tag')}
    </span>
  );
}
