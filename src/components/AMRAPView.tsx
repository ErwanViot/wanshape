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
  rounds: number;
  onIncrementRound: () => void;
  showVideos: boolean;
  onToggleShowVideos: () => void;
}

export function AMRAPView({ step, remaining, progress, rounds, onIncrementRound, showVideos, onToggleShowVideos }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      {/* Block name */}
      <h2 className="text-2xl font-bold text-white">{step.blockName}</h2>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} />

      {/* Exercise list */}
      <div className="w-full max-w-sm space-y-2">
        {step.amrapExercises?.map((ex, i) => {
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

      {/* Always-show toggle */}
      {step.amrapExercises?.some((ex) => getExerciseVideoUrl(ex.name)) && (
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

      {/* Round counter + button */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: step.blockColor }}>
            {rounds}
          </div>
          <div className="text-white/50 text-xs">rounds</div>
        </div>

        <button
          type="button"
          onClick={onIncrementRound}
          className="h-16 px-8 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
          style={{ backgroundColor: step.blockColor }}
        >
          +1 Round
        </button>
      </div>
    </div>
  );
}
