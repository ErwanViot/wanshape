import { useMemo, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router';
import type { Session } from '../types/session.ts';
import { compileSession } from '../engine/interpreter.ts';
import { useSession } from '../hooks/useSession.ts';
import { useWorkout } from '../hooks/useWorkout.ts';
import { useWakeLock } from '../hooks/useWakeLock.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import { GlobalProgress } from './GlobalProgress.tsx';
import { ExerciseView } from './ExerciseView.tsx';
import { RepsView } from './RepsView.tsx';
import { RestView } from './RestView.tsx';
import { EMOMView } from './EMOMView.tsx';
import { AMRAPView } from './AMRAPView.tsx';
import { BlockTransition } from './BlockTransition.tsx';
import { EndScreen } from './EndScreen.tsx';
import { Controls } from './Controls.tsx';

export function PlayerPage() {
  const { dateKey } = useParams<{ dateKey: string }>();
  const { session, loading } = useSession(dateKey ?? null);

  useDocumentHead({
    title: session ? `${session.title} — En cours` : 'Séance en cours',
  });

  if (!isHealthAccepted()) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😴</div>
          <p className="text-white/60 text-lg font-medium">Séance introuvable.</p>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return <Player session={session} />;
}

function Player({ session }: { session: Session }) {
  const navigate = useNavigate();
  const steps = useMemo(() => compileSession(session), [session]);

  const workout = useWorkout(steps);

  useWakeLock(workout.status !== 'idle' && workout.status !== 'complete');

  useEffect(() => {
    if (workout.status === 'idle' && steps.length > 0) {
      workout.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goHome = () => navigate('/');

  if (workout.status === 'complete') {
    return (
      <EndScreen
        session={session}
        amrapRounds={workout.amrapRounds}
        onBack={goHome}
      />
    );
  }

  const step = workout.currentStep;
  if (!step) return null;

  const bgOpacity = step.phase === 'rest'
    ? '25'
    : step.phase === 'transition'
      ? '18'
      : '12';

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: '#0a0a0a',
        backgroundImage: `linear-gradient(${step.blockColor}${bgOpacity}, ${step.blockColor}${bgOpacity})`,
      }}
    >
      {/* Top bar: progress + quit */}
      <div className="relative">
        <GlobalProgress
          steps={steps}
          currentStepIndex={workout.currentStepIndex}
          progress={workout.globalProgress}
        />
        <button
          onClick={goHome}
          className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white/80 hover:bg-white/20 transition-colors"
          aria-label="Quitter la séance"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Block info */}
      <div className="px-6 pt-4 pb-2">
        <div
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: step.blockColor }}
        >
          {step.blockName}
        </div>
      </div>

      {/* Paused overlay */}
      {workout.status === 'paused' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4">Pause</div>
            <button
              onClick={workout.togglePause}
              className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg active:scale-95 transition-transform"
            >
              Reprendre
            </button>
          </div>
        </div>
      )}

      {/* Main content by step type */}
      <div key={step.id} className="flex-1 flex flex-col animate-fade-in">
        {step.phase === 'transition' && (
          <BlockTransition
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
          />
        )}

        {step.phase === 'prepare' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <p className="text-white/60 text-lg">{step.instructions}</p>
            <div
              className="text-8xl font-bold font-mono animate-countdown"
              style={{ color: step.blockColor }}
            >
              {workout.timer.remaining}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step.exerciseName}
            </h2>
          </div>
        )}

        {step.phase === 'work' && step.timerMode === 'emom' && (
          <EMOMView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
          />
        )}

        {step.phase === 'work' && step.timerMode === 'amrap' && (
          <AMRAPView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
            rounds={workout.amrapRounds}
            onIncrementRound={workout.incrementAmrap}
          />
        )}

        {step.phase === 'work' && step.timerMode === 'countdown' && (
          <ExerciseView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
          />
        )}

        {step.phase === 'work' && step.timerMode === 'manual' && (
          <RepsView
            step={step}
            onDone={workout.done}
          />
        )}

        {step.phase === 'rest' && (
          <RestView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
            onSkip={workout.skip}
          />
        )}
      </div>

      {/* Controls */}
      <Controls
        status={workout.status}
        audioEnabled={workout.audio.enabled}
        onTogglePause={workout.togglePause}
        onSkip={workout.skip}
        onToggleAudio={workout.audio.toggle}
      />

      {/* Health reminder */}
      <div className="px-6 pb-3 text-center">
        <p className="text-[10px] text-white/25">
          Écoutez votre corps. En cas de douleur, arrêtez immédiatement.
        </p>
      </div>
    </div>
  );
}
