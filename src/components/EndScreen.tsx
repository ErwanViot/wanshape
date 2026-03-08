import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Trophy } from 'lucide-react';
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
  customSessionId?: string;
}

export function EndScreen({ session, amrapRounds, durationSeconds, onBack, programSessionId, customSessionId }: Props) {
  const { user } = useAuth();
  const { save, saved } = useSaveCompletion();

  useEffect(() => {
    if (!user) return;
    save({
      sessionDate: programSessionId || customSessionId ? undefined : session.date,
      programSessionId,
      customSessionId,
      durationSeconds,
      amrapRounds,
      sessionTitle: session.title,
    });
  }, [user, save, session.date, programSessionId, customSessionId, durationSeconds, amrapRounds]);

  const realMinutes = durationSeconds > 0 ? Math.round(durationSeconds / 60) : session.estimatedDuration;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center bg-[#0a0a0a]">
      {/* Trophy */}
      <div className="w-20 h-20 rounded-full bg-brand/15 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-brand" aria-hidden="true" />
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">Séance terminée !</h1>

      <p className="text-white/60 text-lg">{session.title}</p>

      {user && saved && (
        <div className="flex items-center gap-2 text-accent text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
          Séance enregistrée
        </div>
      )}

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
        {programSessionId ? 'Retour au programme' : customSessionId ? 'Retour à la séance' : "Retour à l'accueil"}
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
      <p className="text-white text-sm font-semibold mb-1">Ne perds pas ta progression</p>
      <p className="text-white/50 text-xs leading-relaxed mb-4">
        Sans compte, cette séance disparaît. Crée ton compte gratuit pour suivre ta progression et garder ta dynamique.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/signup" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white">
          Créer mon compte
        </Link>
        <button type="button" onClick={dismiss} className="text-white/40 text-xs hover:text-white/60 transition-colors">
          Plus tard
        </button>
      </div>
    </div>
  );
}
