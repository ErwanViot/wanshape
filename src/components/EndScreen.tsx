import { Check, Download, Share2, Sparkles, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { STORAGE_KEYS } from '../config/storage-keys.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSaveCompletion } from '../hooks/useSaveCompletion.ts';
import { captureEvent } from '../lib/analytics.ts';
import { supabase } from '../lib/supabase.ts';
import type { Session } from '../types/session.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';
import { shareSession } from '../utils/share.ts';
import { NutritionSuggestion } from './recipes/NutritionSuggestion.tsx';

interface Props {
  session: Session;
  amrapRounds: number;
  durationSeconds: number;
  onBack: () => void;
  programSessionId?: string;
  customSessionId?: string;
}

export function EndScreen({ session, amrapRounds, durationSeconds, onBack, programSessionId, customSessionId }: Props) {
  const { t } = useTranslation(['player', 'common']);
  const { user, profile, loading: authLoading } = useAuth();
  const { save, saved, error: saveError } = useSaveCompletion();
  const isPremium = profile?.subscription_tier === 'premium';

  useEffect(() => {
    if (!user || !durationSeconds) return;
    save({
      sessionDate: programSessionId || customSessionId ? undefined : session.date,
      programSessionId,
      customSessionId,
      durationSeconds,
      amrapRounds,
      sessionTitle: session.title,
      sessionDescription: session.description,
      sessionFocus: session.focus,
      blockTypes: [...new Set(session.blocks.map((b) => b.type).filter((t) => t !== 'warmup' && t !== 'cooldown'))],
    });
  }, [
    user,
    save,
    session.date,
    session.title,
    session.description,
    session.focus,
    session.blocks,
    programSessionId,
    customSessionId,
    durationSeconds,
    amrapRounds,
  ]);

  // Single fire-and-forget event per completion. The session payload
  // intentionally omits the title (free-text user input via custom
  // sessions) — only structured fields go to analytics.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only fires on mount with the initial completion props
  useEffect(() => {
    if (!durationSeconds) return;
    captureEvent('session_completed', {
      duration_seconds: durationSeconds,
      block_types: [...new Set(session.blocks.map((b) => b.type))],
      block_count: session.blocks.length,
      amrap_rounds: amrapRounds,
      origin: programSessionId ? 'program' : customSessionId ? 'custom' : 'daily',
    });
  }, []);

  const rawMinutes = durationSeconds > 0 ? Math.round(durationSeconds / 60) : session.estimatedDuration;
  const realMinutes = rawMinutes > 0 ? rawMinutes : 1;
  const displayMinutes = durationSeconds > 0 && durationSeconds < 60 ? '< 1' : String(realMinutes);
  const difficultyLevel = computeDifficulty(session).level;
  const difficultyLabel = t(`common:difficulty.${difficultyLevel}`);

  const [shareState, setShareState] = useState<'idle' | 'loading' | 'shared' | 'copied'>('idle');

  const handleShare = useCallback(async () => {
    setShareState('loading');
    try {
      const result = await shareSession({
        session,
        realMinutes,
        amrapRounds,
        difficultyLabel,
        labels: {
          minutes: t('end_screen.share_label_minutes'),
          blocks: t('end_screen.share_label_blocks'),
          difficulty: t('end_screen.share_label_difficulty'),
          rounds: t('end_screen.share_label_rounds'),
          trophyMessage: t('end_screen.share_trophy_message'),
          joinCta: t('end_screen.share_join_cta'),
          amrapSuffix: t('end_screen.share_amrap_suffix'),
        },
      });
      setShareState(result);
      setTimeout(() => setShareState('idle'), 3000);
    } catch {
      // User cancelled share sheet or other error
      setShareState('idle');
    }
  }, [session, realMinutes, amrapRounds, difficultyLabel, t]);

  const minutesUnit = displayMinutes === '< 1' ? t('end_screen.minutes_unit_one') : t('end_screen.minutes_unit_other');

  const backLabel = programSessionId
    ? t('end_screen.back_program')
    : customSessionId
      ? t('end_screen.back_custom_session')
      : t('end_screen.back_home');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center bg-[#0a0a0a]">
      {/* Trophy */}
      <div className="w-20 h-20 rounded-full bg-brand/15 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-brand" aria-hidden="true" />
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">{t('end_screen.title')}</h1>

      <p className="text-white/60 text-lg">{session.title}</p>

      {user && saved && (
        <div className="flex items-center gap-2 text-accent text-sm font-medium">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {t('end_screen.saved_badge')}
        </div>
      )}

      {user && saveError && !saved && (
        <div className="flex flex-col items-center gap-2 text-sm">
          <p className="text-red-400">{t('end_screen.save_error')}</p>
          <button
            type="button"
            onClick={() =>
              save({
                sessionDate: programSessionId || customSessionId ? undefined : session.date,
                programSessionId,
                customSessionId,
                durationSeconds,
                amrapRounds,
                sessionTitle: session.title,
                sessionDescription: session.description,
                sessionFocus: session.focus,
                blockTypes: [
                  ...new Set(session.blocks.map((b) => b.type).filter((t) => t !== 'warmup' && t !== 'cooldown')),
                ],
              })
            }
            className="text-brand hover:text-brand-secondary font-semibold transition-colors cursor-pointer"
          >
            {t('end_screen.retry')}
          </button>
        </div>
      )}

      <div className="flex gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{displayMinutes}</div>
          <div className="text-white/50 text-sm">{minutesUnit}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{session.blocks.length}</div>
          <div className="text-white/50 text-sm">{t('end_screen.blocks_unit')}</div>
        </div>
        {amrapRounds > 0 && (
          <div className="text-center">
            <div className="text-3xl font-bold text-amrap">{amrapRounds}</div>
            <div className="text-white/50 text-sm">{t('end_screen.amrap_rounds_unit')}</div>
          </div>
        )}
      </div>

      {!user && supabase && <SignupNudge />}
      {user && !authLoading && profile && !isPremium && <PremiumTeaser />}
      {user && <NutritionSuggestion seed={`${session.date}-${session.title}`} />}

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
              {t('end_screen.share_loading')}
            </>
          ) : shareState === 'shared' ? (
            <>
              <Check className="w-5 h-5" aria-hidden="true" />
              {t('end_screen.share_shared')}
            </>
          ) : shareState === 'copied' ? (
            <>
              <Download className="w-5 h-5" aria-hidden="true" />
              {t('end_screen.share_copied')}
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" aria-hidden="true" />
              {t('end_screen.share_idle')}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg active:scale-95 transition-transform"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}

const NUDGE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function SignupNudge() {
  const { t } = useTranslation('player');
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
    try {
      localStorage.setItem(STORAGE_KEYS.NUDGE_DISMISSED, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
      <p className="text-white text-sm font-semibold mb-1">{t('signup_nudge.title')}</p>
      <p className="text-white/50 text-xs leading-relaxed mb-4">{t('signup_nudge.body')}</p>
      <div className="flex items-center gap-3">
        <Link to="/signup" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white">
          {t('signup_nudge.cta')}
        </Link>
        <button type="button" onClick={dismiss} className="text-white/40 text-xs hover:text-white/60 transition-colors">
          {t('signup_nudge.dismiss')}
        </button>
      </div>
    </div>
  );
}

const PREMIUM_TEASER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Shown on the EndScreen to non-premium authenticated users, right after the
 * rush of completing a session — the highest-engagement moment in the funnel
 * (audit 2026-04-18 06-business-ux, R2). Cooldown 7d to stay friendly: a
 * regular exerciser sees it once a week, not at every session.
 */
function PremiumTeaser() {
  const { t } = useTranslation('player');
  const [visible, setVisible] = useState(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEYS.PREMIUM_TEASER_DISMISSED);
      if (!dismissed) return true;
      return Date.now() - Number(dismissed) > PREMIUM_TEASER_COOLDOWN_MS;
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREMIUM_TEASER_DISMISSED, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-gradient-to-br from-brand via-brand-secondary to-brand">
      <div className="p-5 text-left">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('premium_teaser.dismiss_aria')}
          className="absolute top-2.5 right-2.5 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
          <p className="text-white text-sm font-semibold">{t('premium_teaser.heading')}</p>
        </div>
        <p className="text-white/80 text-xs leading-relaxed mb-4 pr-4">{t('premium_teaser.body')}</p>
        <Link
          to="/premium"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-sm font-bold text-white hover:bg-white/30 transition-colors"
        >
          {t('premium_teaser.cta')}
        </Link>
      </div>
    </div>
  );
}
