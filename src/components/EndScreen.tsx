import type { Session } from '../types/session.ts';

interface Props {
  session: Session;
  amrapRounds: number;
  onBack: () => void;
}

export function EndScreen({ session, amrapRounds, onBack }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center bg-[#0a0a0a]">
      {/* Trophy */}
      <div className="text-7xl">
        💪
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white">
        Séance terminée !
      </h1>

      <p className="text-white/60 text-lg">
        {session.title}
      </p>

      <div className="flex gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{session.estimatedDuration}</div>
          <div className="text-white/50 text-sm">minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{session.blocks.length}</div>
          <div className="text-white/50 text-sm">blocs</div>
        </div>
        {amrapRounds > 0 && (
          <div className="text-center">
            <div className="text-3xl font-bold text-amrap">{amrapRounds}</div>
            <div className="text-white/50 text-sm">rounds AMRAP</div>
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="mt-4 px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg active:scale-95 transition-transform"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
