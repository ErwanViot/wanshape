import { useCallback, useEffect, useRef, useState } from 'react';
import { countdownGo, countdownTick } from '../lib/haptics.ts';
import type { AtomicStep, PlayerStatus } from '../types/player.ts';
import { useAudio } from './useAudio.ts';
import { useTimer } from './useTimer.ts';

export function useWorkout(steps: AtomicStep[]) {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [amrapRounds, setAmrapRounds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const previousStatusRef = useRef<PlayerStatus>('idle');
  const startedAtRef = useRef(0);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const audio = useAudio();

  const currentStep = steps[currentStepIndex] ?? null;

  const advanceToNext = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= stepsRef.current.length) {
        setStatus('complete');
        audio.beepSessionEnd();
        return prev;
      }

      const nextStep = stepsRef.current[nextIndex];
      setAmrapRounds(0);

      if (nextStep.phase === 'transition') {
        setStatus('transition');
      } else if (nextStep.phase === 'prepare') {
        setStatus('countdown');
      } else if (nextStep.phase === 'rest') {
        setStatus('rest');
      } else {
        setStatus('active');
      }

      return nextIndex;
    });
  }, [audio]);

  const onTimerComplete = useCallback(() => {
    if (!currentStep) return;

    if (currentStep.isLastInBlock && currentStep.phase === 'work') {
      audio.beepBlockEnd();
    } else if (currentStep.isLastInRound && currentStep.phase === 'work') {
      audio.beepRoundEnd();
    } else if (currentStep.phase === 'prepare') {
      audio.speakGo();
    } else if (currentStep.phase === 'transition') {
      audio.beepGo();
    }

    advanceToNext();
  }, [currentStep, advanceToNext, audio]);

  const timer = useTimer(onTimerComplete);

  // Start timer when status/step changes
  useEffect(() => {
    if (!currentStep) return;
    if (status === 'paused' || status === 'idle' || status === 'complete') return;

    if (currentStep.timerMode === 'manual') {
      // No timer for manual steps — voice announcements removed (beeps only)
      return;
    }

    if (currentStep.timerMode === 'amrap') {
      if (currentStep.duration == null || currentStep.duration <= 0) return;
      timer.start(currentStep.duration, 'down');
      return;
    }

    if (currentStep.timerMode === 'emom') {
      if (currentStep.duration == null || currentStep.duration <= 0) return;
      timer.start(currentStep.duration, 'down');
      return;
    }

    if (currentStep.duration != null && currentStep.duration > 0) {
      timer.start(currentStep.duration, 'down');
    }
    // currentStep and timer.start are the actual reactive deps; status gates execution.
    // audio beep callbacks are stable refs and don't need to be listed.
  }, [status, currentStep, timer.start]); // eslint-disable-line react-hooks/exhaustive-deps

  // Branded countdown on first block transition (Wan..2..Fit!)
  useEffect(() => {
    if (status === 'transition' && currentStep?.blockIndex === 0 && timer.remaining > 0 && timer.remaining <= 3) {
      audio.playBrandedCountdown(timer.remaining);
    }
  }, [timer.remaining, status, currentStep?.blockIndex, audio.playBrandedCountdown]);

  // Countdown beeps for last 3 seconds
  // NB: 'transition' status is NOT handled here — branded countdown audio
  // is played by the dedicated effect above for first-block transitions.
  // audio.beepCountdown and audio.speakCountdown are stable useCallback refs;
  // listing them in deps is fine and shuts the linter up without changing behaviour.
  useEffect(() => {
    if (timer.remaining > 0 && timer.remaining <= 3 && timer.isRunning) {
      if (status === 'countdown') {
        audio.speakCountdown(timer.remaining);
      } else if (status === 'active') {
        audio.beepCountdown();
      }
      // Haptic mirror of the audio cue (native only, no-op on web).
      // Heavy pulse on the final tick (1) so the body feels the "go".
      void (timer.remaining === 1 ? countdownGo() : countdownTick());
    }
  }, [timer.remaining, audio.beepCountdown, audio.speakCountdown, status, timer.isRunning]);

  const start = useCallback(() => {
    if (steps.length === 0) return;
    audio.unlock();
    audio.preloadBrandedSounds();
    startedAtRef.current = Date.now();
    setCurrentStepIndex(0);
    setAmrapRounds(0);
    const firstStep = steps[0];
    if (firstStep.phase === 'transition') {
      setStatus('transition');
    } else {
      setStatus('active');
    }
  }, [steps, audio.unlock, audio.preloadBrandedSounds]);

  const pause = useCallback(() => {
    if (status === 'paused') return;
    previousStatusRef.current = status;
    setStatus('paused');
    timer.pause();
  }, [status, timer]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    const prev = previousStatusRef.current;
    setStatus(prev);
    timer.resume();
  }, [status, timer]);

  const togglePause = useCallback(() => {
    if (status === 'paused') {
      resume();
    } else if (status !== 'idle' && status !== 'complete') {
      pause();
    }
  }, [status, pause, resume]);

  const skip = useCallback(() => {
    if (status === 'idle' || status === 'complete') return;
    timer.skip();
  }, [status, timer]);

  const done = useCallback(() => {
    if (currentStep?.timerMode !== 'manual') return;
    advanceToNext();
  }, [currentStep, advanceToNext]);

  const incrementAmrap = useCallback(() => {
    setAmrapRounds((prev) => prev + 1);
  }, []);

  // Track real duration when workout completes
  useEffect(() => {
    if (status === 'complete' && startedAtRef.current > 0) {
      setDurationSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
    }
  }, [status]);

  // Compute global progress
  const totalEstimated = steps.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const elapsedEstimated = steps.slice(0, currentStepIndex).reduce((sum, s) => sum + s.estimatedDuration, 0);
  const globalProgress = totalEstimated > 0 ? elapsedEstimated / totalEstimated : 0;

  return {
    status,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    timer,
    audio,
    amrapRounds,
    durationSeconds,
    globalProgress,
    start,
    pause,
    resume,
    togglePause,
    skip,
    done,
    incrementAmrap,
  };
}
