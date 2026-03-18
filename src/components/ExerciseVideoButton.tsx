import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { getExerciseVideoUrl } from '../utils/exerciseVideo.ts';
import { PlayerVideoDemo } from './PlayerVideoDemo.tsx';

interface Props {
  exerciseName: string;
  alwaysShow: boolean;
  onToggleAlwaysShow: () => void;
}

export function ExerciseVideoButton({ exerciseName, alwaysShow, onToggleAlwaysShow }: Props) {
  const videoUrl = getExerciseVideoUrl(exerciseName);
  const [expanded, setExpanded] = useState(false);

  if (!videoUrl) return null;

  const visible = expanded || alwaysShow;

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/15 hover:text-white/80 transition-colors"
      >
        {visible ? (
          <>
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Masquer
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            Voir l'exemple
          </>
        )}
      </button>

      {/* Video */}
      {visible && <PlayerVideoDemo videoUrl={videoUrl} />}

      {/* Always-show toggle — only shown when video is visible */}
      {visible && (
        <label className="inline-flex items-center gap-2 text-white/40 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={alwaysShow}
            onChange={onToggleAlwaysShow}
            className="w-3.5 h-3.5 rounded accent-white/60"
          />
          Toujours montrer les exemples
        </label>
      )}
    </div>
  );
}
