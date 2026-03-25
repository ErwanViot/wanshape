import type { AtomicStep } from '../types/player.ts';
import { ExerciseListWithVideos } from './ExerciseListWithVideos.tsx';
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
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      {/* Block name + explanation */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">{step.blockName}</h2>
        <p className="text-white/60 text-sm">Enchaîne les exercices en boucle. Fais un max de tours dans le temps imparti.</p>
      </div>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} />

      {/* Exercise list with video demos */}
      {step.amrapExercises && (
        <ExerciseListWithVideos
          exercises={step.amrapExercises}
          blockColor={step.blockColor}
          showVideos={showVideos}
          onToggleShowVideos={onToggleShowVideos}
        />
      )}

      {/* Round counter + button */}
      <div className="flex flex-col items-center gap-3">
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
        <p className="text-white/60 text-sm">Appuie à chaque tour complété pour suivre ta progression</p>
      </div>
    </div>
  );
}
