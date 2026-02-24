import type { PlayerStatus } from '../types/player.ts';

interface Props {
  status: PlayerStatus;
  audioEnabled: boolean;
  onTogglePause: () => void;
  onSkip: () => void;
  onToggleAudio: () => void;
}

export function Controls({ status, audioEnabled, onTogglePause, onSkip, onToggleAudio }: Props) {
  const isPaused = status === 'paused';
  const showControls = status !== 'idle' && status !== 'complete';

  if (!showControls) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        type="button"
        onClick={onTogglePause}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 active:bg-white/20 transition-colors"
        aria-label={isPaused ? 'Reprendre' : 'Pause'}
      >
        {isPaused ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <rect x="5" y="3" width="4" height="18" />
            <rect x="15" y="3" width="4" height="18" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 active:bg-white/20 transition-colors"
        aria-label="Passer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <polygon points="5,3 15,12 5,21" />
          <rect x="17" y="3" width="3" height="18" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onToggleAudio}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 active:bg-white/20 transition-colors"
        aria-label={audioEnabled ? 'Couper le son' : 'Activer le son'}
      >
        {audioEnabled ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path
              d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M19.07 4.93a10 10 0 010 14.14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
