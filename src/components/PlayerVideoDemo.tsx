import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  videoUrl: string;
  exerciseName?: string;
}

export function PlayerVideoDemo({ videoUrl, exerciseName }: Props) {
  const { t } = useTranslation('player');
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  if (hasError) return null;

  const ariaLabel = exerciseName
    ? t('video_demo.aria_label_with_name', { name: exerciseName })
    : t('video_demo.aria_label_generic');

  return (
    <div className="w-full max-w-xs mx-auto rounded-xl overflow-hidden">
      <video
        autoPlay
        // loop is intentional here: in the player context, the user glances at the demo
        // while exercising, so the clip needs to repeat. ExercisePage omits loop because
        // the user is reading and the video is a one-time preview.
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full aspect-video object-cover"
        aria-label={ariaLabel}
        onError={handleError}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
