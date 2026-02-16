import { useRef, useCallback, useEffect, useState } from 'react';

export interface UseTimerReturn {
  remaining: number;
  isRunning: boolean;
  progress: number;
  start: (duration: number, direction?: "down" | "up") => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
}

export function useTimer(onComplete: () => void): UseTimerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const totalRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'tick') {
        setRemaining(e.data.remaining);
      } else if (e.data.type === 'complete') {
        setIsRunning(false);
        onCompleteRef.current();
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const start = useCallback((duration: number, direction: "down" | "up" = "down") => {
    totalRef.current = duration;
    setRemaining(duration);
    setIsRunning(true);
    workerRef.current?.postMessage({ command: 'start', duration, direction });
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    workerRef.current?.postMessage({ command: 'pause' });
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
    workerRef.current?.postMessage({ command: 'resume' });
  }, []);

  const skip = useCallback(() => {
    setIsRunning(false);
    workerRef.current?.postMessage({ command: 'stop' });
    setRemaining(0);
    onCompleteRef.current();
  }, []);

  const progress = totalRef.current > 0 ? 1 - remaining / totalRef.current : 0;

  return { remaining, isRunning, progress, start, pause, resume, skip };
}
