import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { getExerciseVideoUrl } from '../utils/exerciseVideo.ts';
import { NoVideoTag } from './NoVideoTag.tsx';
import { PlayerVideoDemo } from './PlayerVideoDemo.tsx';

interface Exercise {
  name: string;
  reps: number;
}

interface Props {
  exercises: Exercise[];
  blockColor: string;
  showVideos: boolean;
  onToggleShowVideos: () => void;
}

export function ExerciseListWithVideos({ exercises, blockColor, showVideos, onToggleShowVideos }: Props) {
  const firstVideoIndex = exercises.findIndex((ex) => getExerciseVideoUrl(ex.name));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(firstVideoIndex >= 0 ? firstVideoIndex : null);

  const hasAnyVideo = exercises.some((ex) => getExerciseVideoUrl(ex.name));

  const toggleExercise = (i: number) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <>
      <div className="w-full max-w-sm space-y-3">
        {exercises.map((ex, i) => {
          const videoUrl = getExerciseVideoUrl(ex.name);
          const isExpanded = expandedIndex === i;

          return (
            <div key={`${i}-${ex.name}`} className="space-y-2">
              <button
                type="button"
                onClick={() => videoUrl && toggleExercise(i)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/10 ${videoUrl ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{ex.name}</span>
                  {videoUrl && (
                    <span className="p-1 rounded-md bg-white/5 text-white/40">
                      {isExpanded ? (
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold" style={{ color: blockColor }}>
                  x{ex.reps}
                </span>
              </button>
              {isExpanded && videoUrl && <PlayerVideoDemo videoUrl={videoUrl} exerciseName={ex.name} />}
              {!videoUrl && <NoVideoTag className="ml-4" />}
            </div>
          );
        })}
      </div>

      {hasAnyVideo && (
        <label className="inline-flex items-center gap-2 text-white/40 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showVideos}
            onChange={onToggleShowVideos}
            className="w-3.5 h-3.5 rounded accent-white/60"
          />
          Toujours montrer les exemples
        </label>
      )}
    </>
  );
}
