import { useTranslation } from 'react-i18next';
import type { NextStepPreview } from '../types/player.ts';

interface Props {
  preview: NextStepPreview;
}

export function NextPreview({ preview }: Props) {
  const { t } = useTranslation('player');

  return (
    <div className="text-center text-white/60 text-base">
      <span className="text-white/40">{t('next_preview.label')}</span>
      <span className="text-white/80 font-medium">{preview.exerciseName}</span>
      <span className="text-white/40"> · {preview.description}</span>
    </div>
  );
}
