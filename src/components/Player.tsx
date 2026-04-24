import { HeartPulse } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import { BLOCK_LABELS } from '../engine/constants.ts';
import { compileSession } from '../engine/interpreter.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import { useSession } from '../hooks/useSession.ts';
import { useWakeLock } from '../hooks/useWakeLock.ts';
import { useWorkout } from '../hooks/useWorkout.ts';
import type { AtomicStep } from '../types/player.ts';
import type { Session } from '../types/session.ts';
import { getTodayKey } from '../utils/date.ts';
import { AMRAPView } from './AMRAPView.tsx';
import { BlockTransition } from './BlockTransition.tsx';
import { Controls } from './Controls.tsx';
import { EMOMView } from './EMOMView.tsx';
import { EndScreen } from './EndScreen.tsx';
import { ExerciseView } from './ExerciseView.tsx';
import { GlobalProgress } from './GlobalProgress.tsx';
import { PlayerLoader } from './LoadingSpinner.tsx';
import { PlayerErrorBoundary } from './PlayerErrorBoundary.tsx';
import { RepsView } from './RepsView.tsx';
import { RestView } from './RestView.tsx';
import { SessionNotFound } from './SessionNotFound.tsx';

export function PlayerPage() {
  const { dateKey: paramDateKey } = useParams<{ dateKey?: string }>();
  const dateKey = paramDateKey ?? getTodayKey();
  const { session, loading } = useSession(dateKey);
  const { t } = useTranslation('player');

  useDocumentHead({
    title: session ? `${session.title} — ${t('page.title_in_progress')}` : t('page.title_default'),
  });

  if (!isHealthAccepted()) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <PlayerLoader />;
  if (!session) return <SessionNotFound />;

  return (
    <PlayerErrorBoundary>
      <Player session={session} />
    </PlayerErrorBoundary>
  );
}

function getBlockProgress(step: AtomicStep): string {
  if (step.phase === 'transition') return '';
  // Exercise-based: classic, pyramid, warmup, cooldown
  if (step.exerciseInfo) return `${step.exerciseInfo.current}/${step.exerciseInfo.total}`;
  // Round-based: circuit, hiit, tabata, emom
  if (step.roundInfo) return `${step.roundInfo.current}/${step.roundInfo.total}`;
  // Set-based: superset
  if (step.setInfo) return `${step.setInfo.current}/${step.setInfo.total}`;
  return '';
}

function BlockBreadcrumb({ session, step }: { session: Session; step: AtomicStep }) {
  const progress = getBlockProgress(step);

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs tracking-wide">
      {session.blocks.map((block, i) => {
        const isActive = i === step.blockIndex;
        const isPast = i < step.blockIndex;

        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-white/15">›</span>}
            <span
              className={isActive ? 'font-semibold' : 'font-medium'}
              style={{
                color: isActive ? step.blockColor : isPast ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {BLOCK_LABELS[block.type]}
              {isActive && progress && ` - ${progress}`}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function Player({
  session,
  programSessionId,
  customSessionId,
  backTo = '/',
}: {
  session: Session;
  programSessionId?: string;
  customSessionId?: string;
  backTo?: string;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation('player');
  const steps = useMemo(() => compileSession(session), [session]);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showVideos, setShowVideos] = useState(() => localStorage.getItem('wan2fit-show-exercise-videos') === 'true');
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  const quitDialogRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const workout = useWorkout(steps);

  useWakeLock(workout.status !== 'idle' && workout.status !== 'complete');

  const startOnce = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    workout.start();
  }, [workout.start]);

  useEffect(() => {
    if (workout.status === 'idle' && steps.length > 0) {
      startOnce();
    }
  }, [steps.length, startOnce, workout.status]);

  // Focus the resume button when pause overlay is shown
  useEffect(() => {
    if (workout.status === 'paused' && resumeButtonRef.current) {
      resumeButtonRef.current.focus();
    }
  }, [workout.status]);

  const toggleShowVideos = useCallback(() => {
    setShowVideos((prev) => {
      const next = !prev;
      localStorage.setItem('wan2fit-show-exercise-videos', String(next));
      return next;
    });
  }, []);

  const goBack = () => navigate(backTo);

  if (workout.status === 'complete') {
    return (
      <EndScreen
        session={session}
        amrapRounds={workout.amrapRounds}
        durationSeconds={workout.durationSeconds}
        onBack={goBack}
        programSessionId={programSessionId}
        customSessionId={customSessionId}
      />
    );
  }

  const step = workout.currentStep;
  if (!step) return null;

  const bgOpacity = step.phase === 'rest' ? '25' : step.phase === 'transition' ? '18' : '12';

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
        <GlobalProgress steps={steps} currentStepIndex={workout.currentStepIndex} progress={workout.globalProgress} />
        <button
          type="button"
          onClick={() => {
            if (workout.status !== 'paused') workout.togglePause();
            setShowQuitConfirm(true);
          }}
          className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white/80 hover:bg-white/20 transition-colors"
          aria-label={t('quit_button.aria_label')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Block breadcrumb */}
      <div className="px-6 pt-4 pb-2">
        <BlockBreadcrumb session={session} step={step} />
      </div>

      {/* Paused overlay */}
      {workout.status === 'paused' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('pause_overlay.title')}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/70"
          onKeyDown={(e) => {
            if (e.key === 'Escape') workout.togglePause();
            if (e.key === 'Tab') {
              e.preventDefault();
              resumeButtonRef.current?.focus();
            }
          }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4">{t('pause_overlay.title')}</div>
            <button
              ref={resumeButtonRef}
              type="button"
              onClick={workout.togglePause}
              className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg active:scale-95 transition-transform"
            >
              {t('pause_overlay.resume')}
            </button>
          </div>
        </div>
      )}

      {/* Quit confirmation overlay */}
      {showQuitConfirm && (
        <div
          ref={quitDialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="quit-dialog-title"
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowQuitConfirm(false);
              workout.togglePause();
            }
            if (e.key === 'Tab') {
              const focusable = quitDialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)');
              if (!focusable || focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          <div className="text-center px-6">
            <p id="quit-dialog-title" className="text-xl font-bold text-white mb-2">
              {t('quit_dialog.title')}
            </p>
            <p className="text-white/70 mb-6">{t('quit_dialog.body')}</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowQuitConfirm(false);
                  workout.togglePause();
                }}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold"
              >
                {t('quit_dialog.cancel')}
              </button>
              <button
                type="button"
                // biome-ignore lint/a11y/noAutofocus: alertdialog pattern — focus must land on the confirmation CTA to let the user cancel via Escape or confirm with Enter without hunting for the button.
                autoFocus
                onClick={() => navigate(backTo)}
                className="px-6 py-3 rounded-xl bg-white text-black font-semibold"
              >
                {t('quit_dialog.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content by step type */}
      <div key={step.id} className="flex-1 flex flex-col animate-fade-in">
        {step.phase === 'transition' && (
          <BlockTransition step={step} remaining={workout.timer.remaining} progress={workout.timer.progress} />
        )}

        {step.phase === 'prepare' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <p className="text-white/60 text-lg">{step.instructions}</p>
            <div className="text-8xl font-bold font-mono animate-countdown" style={{ color: step.blockColor }}>
              {workout.timer.remaining}
            </div>
            <h2 className="text-2xl font-bold text-white">{step.exerciseName}</h2>
          </div>
        )}

        {step.phase === 'work' && step.timerMode === 'emom' && (
          <EMOMView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
            showVideos={showVideos}
            onToggleShowVideos={toggleShowVideos}
          />
        )}

        {step.phase === 'work' && step.timerMode === 'amrap' && (
          <AMRAPView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
            rounds={workout.amrapRounds}
            onIncrementRound={workout.incrementAmrap}
            showVideos={showVideos}
            onToggleShowVideos={toggleShowVideos}
          />
        )}

        {step.phase === 'work' && step.timerMode === 'countdown' && (
          <ExerciseView
            step={step}
            remaining={workout.timer.remaining}
            progress={workout.timer.progress}
            showVideos={showVideos}
            onToggleShowVideos={toggleShowVideos}
          />
        )}

        {step.phase === 'work' && step.timerMode === 'manual' && (
          <RepsView step={step} onDone={workout.done} showVideos={showVideos} onToggleShowVideos={toggleShowVideos} />
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
      <div className="px-6 pb-3 text-center space-y-0.5">
        <p className="text-sm text-white/70 inline-flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4 shrink-0" aria-hidden="true" />
          {t('health_reminder.listen')}
        </p>
        <p className="text-sm text-white/70">{t('health_reminder.stop_pain')}</p>
      </div>
    </div>
  );
}
