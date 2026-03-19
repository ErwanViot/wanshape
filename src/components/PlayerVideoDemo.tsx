import { useCallback, useState } from 'react';

interface Props {
  videoUrl: string;
  exerciseName?: string;
}

export function PlayerVideoDemo({ videoUrl, exerciseName }: Props) {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  if (hasError) return null;

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
        aria-label={exerciseName ? `Démonstration : ${exerciseName}` : "Démonstration de l'exercice"}
        onError={handleError}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
