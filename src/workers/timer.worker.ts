// Drift-corrected countdown / countup worker.
//
// A naïve `setInterval(tick, 1000)` accumulates drift on long sessions
// because the OS may delay the next callback under load (background
// throttling, GC pause, low-power mode). On a 45-min HIIT session the
// cumulative skew can reach 2–5 s, which is unacceptable for interval
// timing.
//
// Instead we recompute the remaining/elapsed value from a wall-clock
// reference (`performance.now()`) on every tick. The `setInterval`
// only triggers the recomputation; the value itself is always derived
// from absolute time, so no drift accumulates. Pauses are accounted
// for via `pausedElapsedSec` which captures the time already spent
// running before the pause, then `startedAt` is reset on resume.

let intervalId: ReturnType<typeof setInterval> | null = null;
let totalDurationSec = 0;
let counting: 'down' | 'up' = 'down';
let startedAt = 0;
let pausedElapsedSec = 0;

function elapsedSeconds(): number {
  if (startedAt === 0) return pausedElapsedSec;
  return pausedElapsedSec + Math.floor((performance.now() - startedAt) / 1000);
}

function tick() {
  const elapsed = elapsedSeconds();
  if (counting === 'down') {
    const remaining = Math.max(0, totalDurationSec - elapsed);
    if (remaining <= 0) {
      self.postMessage({ type: 'tick', remaining: 0 });
      self.postMessage({ type: 'complete' });
      stopInterval();
      return;
    }
    self.postMessage({ type: 'tick', remaining });
  } else {
    self.postMessage({ type: 'tick', remaining: elapsed });
  }
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

self.onmessage = (e: MessageEvent) => {
  const { command, duration, direction } = e.data;

  switch (command) {
    case 'start':
      stopInterval();
      totalDurationSec = duration;
      counting = direction === 'up' ? 'up' : 'down';
      pausedElapsedSec = 0;
      startedAt = performance.now();
      self.postMessage({ type: 'tick', remaining: counting === 'down' ? totalDurationSec : 0 });
      intervalId = setInterval(tick, 1000);
      break;

    case 'pause':
      pausedElapsedSec = elapsedSeconds();
      startedAt = 0;
      stopInterval();
      break;

    case 'resume':
      if (intervalId === null) {
        startedAt = performance.now();
        intervalId = setInterval(tick, 1000);
      }
      break;

    case 'stop':
      stopInterval();
      totalDurationSec = 0;
      pausedElapsedSec = 0;
      startedAt = 0;
      break;
  }
};
