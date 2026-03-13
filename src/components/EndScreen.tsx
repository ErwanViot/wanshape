import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Trophy, Share2, Check, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { STORAGE_KEYS } from '../config/storage-keys.ts';
import { useSaveCompletion } from '../hooks/useSaveCompletion.ts';
import { shareSession } from '../utils/share.ts';
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
  const { save, saved, error: saveError } = useSaveCompletion();

  useEffect(() => {
    if (!user || !durationSeconds) return;
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

  const [shareState, setShareState] = useState<'idle' | 'loading' | 'shared' | 'copied'>('idle');

  const handleShare = useCallback(async () => {
    setShareState('loading');
    try {
      const result = await shareSession({ session, realMinutes, amrapRounds });
      setShareState(result);
      setTimeout(() => setShareState('idle'), 3000);
    } catch (err) {
      // User cancelled share sheet or other error
      setShareState('idle');
    }
  }, [session, realMinutes, amrapRounds]);

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

      {user && saveError && !saved && (
        <div className="flex flex-col items-center gap-2 text-sm">
          <p className="text-red-400">Enregistrement échoué</p>
          <button
            type="button"
            onClick={() => save({
              sessionDate: programSessionId || customSessionId ? undefined : session.date,
              programSessionId,
              customSessionId,
              durationSeconds,
              amrapRounds,
              sessionTitle: session.title,
            })}
            className="text-brand hover:text-brand-secondary font-semibold transition-colors cursor-pointer"
          >
            Réessayer
          </button>
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

      <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
        <button
          type="button"
          onClick={handleShare}
          disabled={shareState === 'loading'}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl btn-primary font-bold text-lg text-white active:scale-95 transition-transform disabled:opacity-60"
        >
          {shareState === 'loading' ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Génération…
            </>
          ) : shareState === 'shared' ? (
            <>
              <Check className="w-5 h-5" aria-hidden="true" />
              Partagé !
            </>
          ) : shareState === 'copied' ? (
            <>
              <Download className="w-5 h-5" aria-hidden="true" />
              Image téléchargée &amp; lien copié !
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" aria-hidden="true" />
              Partager ma séance
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg active:scale-95 transition-transform"
        >
          {programSessionId ? 'Retour au programme' : customSessionId ? 'Retour à la séance' : "Retour à l'accueil"}
        </button>
      </div>
    </div>
  );
}

const NUDGE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function SignupNudge() {
  const [visible, setVisible] = useState(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEYS.NUDGE_DISMISSED);
      if (!dismissed) return true;
      return Date.now() - Number(dismissed) > NUDGE_COOLDOWN_MS;
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEYS.NUDGE_DISMISSED, String(Date.now())); } catch { /* ignore */ }
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
