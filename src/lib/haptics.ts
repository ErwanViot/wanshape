import { isNative } from './capacitor.ts';

// Map our intent to Capacitor's ImpactStyle without importing the plugin
// at module load — keeps the web bundle clean (no native bindings).
type Intensity = 'light' | 'medium' | 'heavy';

async function impact(intensity: Intensity): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const style =
      intensity === 'heavy' ? ImpactStyle.Heavy : intensity === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
    await Haptics.impact({ style });
  } catch (err) {
    console.warn('[haptics] impact failed', err);
  }
}

// Light tick on each remaining second of a 3-2-1 countdown — matches
// the cadence of audio.beepCountdown / audio.speakCountdown.
export function countdownTick(): Promise<void> {
  return impact('light');
}

// Heavier "go" pulse when the countdown reaches zero / first work tick.
export function countdownGo(): Promise<void> {
  return impact('heavy');
}
