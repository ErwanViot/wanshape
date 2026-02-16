import type { NextStepPreview } from '../types/player.ts';

interface Props {
  preview: NextStepPreview;
}

export function NextPreview({ preview }: Props) {
  return (
    <div className="text-center text-white/60 text-sm">
      <span className="text-white/40">Suivant : </span>
      <span className="text-white/80 font-medium">{preview.exerciseName}</span>
      <span className="text-white/40"> · {preview.description}</span>
    </div>
  );
}
