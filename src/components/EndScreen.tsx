import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSaveCompletion } from '../hooks/useSaveCompletion.ts';
import { supabase } from '../lib/supabase.ts';
import type { Session } from '../types/session.ts';

interface Props {
  session: Session;
  amrapRounds: number;
  durationSeconds: number;
  onBack: () => void;
  programSessionId?: string;
}

export function EndScreen({ session, amrapRounds, durationSeconds, onBack, programSessionId }: Props) {
  const { user } = useAuth();
  const { save, saved } = useSaveCompletion();

  useEffect(() => {
    if (!user) return;
    save({
      sessionDate: programSessionId ? undefined : session.date,
      programSessionId,
      durationSeconds,
      amrapRounds,
    });
  }, [user, save, session.date, programSessionId, durationSeconds, amrapRounds]);

  const realMinutes = durationSeconds > 0 ? Math.round(durationSeconds / 60) : session.estimatedDuration;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center bg-[#0a0a0a]">
      {/* Trophy */}
      <div className="text-7xl">💪</div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white">Séance terminée !</h1>

      <p className="text-white/60 text-lg">{session.title}</p>

      {user && saved && <p className="text-emerald-400 text-sm font-medium">Séance enregistrée</p>}

      <div className="flex gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{realMinutes}</div>
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

      {!user && supabase && <SignupNudge />}

      <button
        type="button"
        onClick={onBack}
        className="mt-4 px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg active:scale-95 transition-transform"
      >
        {programSessionId ? 'Retour au programme' : "Retour à l'accueil"}
      </button>
    </div>
  );
}

const NUDGE_STORAGE_KEY = 'wan-shape-nudge-dismissed';
const NUDGE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function SignupNudge() {
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(NUDGE_STORAGE_KEY);
    if (!dismissed) return true;
    return Date.now() - Number(dismissed) > NUDGE_COOLDOWN_MS;
  });

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(NUDGE_STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
      <p className="text-white text-sm font-semibold mb-1">Ne perdez pas votre progression</p>
      <p className="text-white/50 text-xs leading-relaxed mb-4">
        Sans compte, cette séance ne sera pas sauvegardée. Créez un compte gratuit pour garder votre historique, votre
        streak et vos programmes.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/signup" className="cta-gradient px-5 py-2.5 rounded-xl text-sm font-bold text-white">
          Créer un compte
        </Link>
        <button type="button" onClick={dismiss} className="text-white/40 text-xs hover:text-white/60 transition-colors">
          Plus tard
        </button>
      </div>
    </div>
  );
}
