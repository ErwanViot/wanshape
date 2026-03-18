import { useState } from 'react';
import { Play, X } from 'lucide-react';
import type { AtomicStep } from '../types/player.ts';
import { getExerciseVideoUrl } from '../utils/exerciseVideo.ts';
import { PlayerVideoDemo } from './PlayerVideoDemo.tsx';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
  showVideos: boolean;
  onToggleShowVideos: () => void;
}

export function EMOMView({ step, remaining, progress, showVideos, onToggleShowVideos }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Minute indicator */}
      <div className="text-white/50 text-sm font-medium">
        {step.roundInfo && `Minute ${step.roundInfo.current}/${step.roundInfo.total}`}
      </div>

      {/* Block name */}
      <h2 className="text-2xl font-bold text-white">{step.blockName}</h2>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} />

      {/* Exercise list */}
      <div className="w-full max-w-sm space-y-3">
        {step.emomExercises?.map((ex, i) => {
          const videoUrl = getExerciseVideoUrl(ex.name);
          const visible = videoUrl && (showVideos || expandedIndex === i);

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{ex.name}</span>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                      className="p-1 rounded-md bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                      aria-label={visible ? "Masquer l'exemple" : "Voir l'exemple"}
                    >
                      {visible ? (
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
                <span className="text-lg font-bold" style={{ color: step.blockColor }}>
                  x{ex.reps}
                </span>
              </div>
              {visible && videoUrl && <PlayerVideoDemo videoUrl={videoUrl} />}
            </div>
          );
        })}
      </div>

      {/* Always-show toggle — only if at least one exercise has a video */}
      {step.emomExercises?.some((ex) => getExerciseVideoUrl(ex.name)) && (
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

      <p className="text-white/40 text-xs">Faites les exercices puis récupérez jusqu'à la prochaine minute</p>
    </div>
  );
}
