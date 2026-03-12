import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../config/storage-keys.ts';

function getStoredAudio(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED);
    return v !== 'false';
  } catch {
    return true;
  }
}

export function useAudio() {
  const [enabled, setEnabled] = useState(getStoredAudio);
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, String(enabled));
  }, [enabled]);

  // Cleanup AudioContext and pending timeouts on unmount
  useEffect(() => {
    return () => {
      for (const id of timeoutsRef.current) clearTimeout(id);
      timeoutsRef.current = [];
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  const scheduleTone = useCallback((fn: () => void, delay: number) => {
    timeoutsRef.current.push(setTimeout(fn, delay));
  }, []);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine') => {
      if (!enabled) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Audio not available
      }
    },
    [enabled, getCtx],
  );

  const beepCountdown = useCallback(() => {
    playTone(440, 0.1, 'square');
  }, [playTone]);

  const beepGo = useCallback(() => {
    playTone(330, 0.15, 'square');
    scheduleTone(() => playTone(330, 0.2, 'square'), 200);
  }, [playTone, scheduleTone]);

  const beepRoundEnd = useCallback(() => {
    playTone(440, 0.1, 'square');
    scheduleTone(() => playTone(440, 0.1, 'square'), 150);
    scheduleTone(() => playTone(440, 0.1, 'square'), 300);
  }, [playTone, scheduleTone]);

  const beepBlockEnd = useCallback(() => {
    playTone(523, 0.3, 'sine');
    scheduleTone(() => playTone(659, 0.3, 'sine'), 200);
    scheduleTone(() => playTone(784, 0.4, 'sine'), 400);
  }, [playTone, scheduleTone]);

  const beepSessionEnd = useCallback(() => {
    playTone(523, 0.2, 'sine');
    scheduleTone(() => playTone(659, 0.2, 'sine'), 200);
    scheduleTone(() => playTone(784, 0.2, 'sine'), 400);
    scheduleTone(() => playTone(1047, 0.4, 'sine'), 600);
  }, [playTone, scheduleTone]);

  const speakCountdown = useCallback(
    (remaining: number) => {
      if (!enabled) return;
      if (remaining <= 3) beepCountdown();
    },
    [enabled, beepCountdown],
  );

  const speakGo = useCallback(() => {
    beepGo();
  }, [beepGo]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return {
    enabled,
    toggle,
    beepCountdown,
    beepGo,
    beepRoundEnd,
    beepBlockEnd,
    beepSessionEnd,
    speakCountdown,
    speakGo,
  };
}
