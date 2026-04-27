import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ClipboardList, Dumbbell, Flame, Moon, RefreshCw, RotateCcw, Sun, Timer, Zap } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BLOCK_COLORS } from '../engine/constants.ts';
import { confirmCustomSession, useCustomSession } from '../hooks/useCustomSessions.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useGenerateSession } from '../hooks/useGenerateSession.ts';
import type { BodyFocus, CustomSessionMode, Intensity } from '../types/custom-session.ts';
import type { Equipment } from '../types/equipment.ts';
import type { Block, Session } from '../types/session.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

const BLOCK_ICONS: Record<string, LucideIcon> = {
  warmup: Sun,
  cooldown: Moon,
  classic: Dumbbell,
  circuit: RefreshCw,
  hiit: Flame,
  tabata: Timer,
  emom: Timer,
  amrap: RotateCcw,
  superset: Zap,
  pyramid: Dumbbell,
};

function BlockDetail({ block, index }: { block: Block; index: number }) {
  const { t } = useTranslation('sessions');
  const { t: tc } = useTranslation('common');
  const color = BLOCK_COLORS[block.type];
  const label = tc(`block_name.${block.type}`);

  const IconComponent = BLOCK_ICONS[block.type] ?? ClipboardList;

  return (
    <div className="glass-card rounded-xl border border-card-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <IconComponent className="w-5 h-5 shrink-0" style={{ color }} aria-hidden="true" />
        <span className="text-sm font-bold" style={{ color }}>
          {index + 1}. {label}
        </span>
        <span className="text-sm text-muted">— {block.name}</span>
        {block.type === 'hiit' && (
          <span className="text-xs text-faint ml-auto">
            {block.rounds}R &middot; {block.work}s/{block.rest}s
          </span>
        )}
        {block.type === 'circuit' && (
          <span className="text-xs text-faint ml-auto">{t('preview.rounds_count', { n: block.rounds })}</span>
        )}
        {block.type === 'tabata' && (
          <span className="text-xs text-faint ml-auto">
            {block.rounds ?? 8}R &middot; {block.work ?? 20}s/{block.rest ?? 10}s
          </span>
        )}
        {block.type === 'emom' && <span className="text-xs text-faint ml-auto">{block.minutes} min</span>}
        {block.type === 'amrap' && (
          <span className="text-xs text-faint ml-auto">{Math.round(block.duration / 60)} min</span>
        )}
      </div>

      {'exercises' in block && Array.isArray(block.exercises) && (
        <ul className="space-y-1.5">
          {(block.exercises as Array<Record<string, unknown>>).map((ex, i) => (
            <li key={i} className="flex items-baseline gap-2 text-sm">
              <span className="text-faint">-</span>
              <span className="font-medium text-heading">{ex.name as string}</span>
              {typeof ex.duration === 'number' && <span className="text-xs text-muted">{ex.duration as number}s</span>}
              {typeof ex.reps === 'number' && <span className="text-xs text-muted">{ex.reps as number} reps</span>}
              {typeof ex.sets === 'number' && <span className="text-xs text-muted">{ex.sets as number} sets</span>}
              {ex.bilateral === true && <span className="text-xs text-faint">{t('preview.bilateral')}</span>}
            </li>
          ))}
        </ul>
      )}

      {'pairs' in block && Array.isArray(block.pairs) && (
        <ul className="space-y-2">
          {(block.pairs as Array<{ exercises: Array<Record<string, unknown>> }>).map((pair, pi) => (
            <li key={pi}>
              <p className="text-xs text-muted mb-1">{t('preview.pair', { n: pi + 1 })}</p>
              <ul className="space-y-1 ml-3">
                {pair.exercises.map((ex, ei) => (
                  <li key={ei} className="flex items-baseline gap-2 text-sm">
                    <span className="text-faint">-</span>
                    <span className="font-medium text-heading">{ex.name as string}</span>
                    {typeof ex.reps === 'number' && (
                      <span className="text-xs text-muted">{ex.reps as number} reps</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CustomSessionPreviewPage() {
  const { t } = useTranslation('sessions');
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { session: record, loading } = useCustomSession(id, user?.id);
  const navigate = useNavigate();
  const { generate, loading: regenerating, error: regenError } = useGenerateSession();

  const [refinementNote, setRefinementNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const confirmingRef = useRef(false);

  const session = record?.session_data as Session | undefined;

  useDocumentHead({
    title: session ? `${session.title} ${t('preview.page_title_suffix')}` : t('preview.default_title'),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!record || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Moon className="w-12 h-12 text-muted mb-4 mx-auto" aria-hidden="true" />
          <p className="text-body text-lg font-medium">{t('preview.not_found_title')}</p>
          <Link to="/seance/custom" className="text-brand hover:text-brand-secondary underline mt-4 inline-block">
            {t('preview.not_found_cta')}
          </Link>
        </div>
      </div>
    );
  }

  const handleRegenerate = async () => {
    const input = {
      mode: record.mode as CustomSessionMode,
      duration: record.duration_minutes,
      ...(record.preset ? { preset: record.preset as 'transpirer' | 'renfo' | 'express' | 'mobilite' } : {}),
      ...(record.equipment.length > 0 ? { equipment: record.equipment as Equipment[] } : {}),
      ...(record.intensity ? { intensity: record.intensity as Intensity } : {}),
      ...(record.body_focus.length > 0 ? { bodyFocus: record.body_focus as BodyFocus[] } : {}),
      ...(record.preferences ? { preferences: record.preferences } : {}),
      refinementNote: refinementNote.trim() || undefined,
      previousSession: session,
    };

    const result = await generate(input);
    if (result) {
      navigate(`/seance/custom/${result.customSessionId}`);
    }
  };

  return (
    <div className="px-6 md:px-10 lg:px-14 pb-12 max-w-2xl mx-auto pt-6 md:pt-4">
      {/* Back */}
      <Link
        to="/seance/custom"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('preview.back')}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading mb-2">{session.title}</h1>
        <p className="text-muted text-sm mb-3">{session.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 border border-brand/20 text-brand">
            ~{session.estimatedDuration} min
          </span>
          {session.focus?.map((f) => (
            <span
              key={f}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-card border border-divider text-muted"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Blocks detail */}
      <h2 className="text-sm font-bold text-heading mb-3 flex items-center gap-1.5">
        <ClipboardList className="w-4 h-4" aria-hidden="true" />
        {t('preview.blocks_title')}
      </h2>
      <div className="space-y-3 mb-8">
        {session.blocks.map((block, i) => (
          <BlockDetail key={i} block={block} index={i} />
        ))}
      </div>

      {/* Start CTA */}
      <button
        type="button"
        disabled={confirming}
        onClick={async () => {
          if (!id || confirmingRef.current) return;
          confirmingRef.current = true;
          setConfirming(true);
          setConfirmError(false);
          const ok = await confirmCustomSession(id).catch(() => false);
          if (ok) {
            navigate(`/seance/custom/${id}/play`);
          } else {
            confirmingRef.current = false;
            setConfirming(false);
            setConfirmError(true);
          }
        }}
        className="cta-gradient w-full py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer block text-center disabled:opacity-50"
      >
        {confirming ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('preview.preparing')}
          </span>
        ) : (
          t('preview.start_cta')
        )}
      </button>

      {/* Confirm error */}
      {confirmError && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
          <p className="text-red-400 mb-2">{t('preview.confirm_error')}</p>
          <button
            type="button"
            onClick={() => navigate(`/seance/custom/${id}/play`)}
            className="text-brand font-semibold text-sm hover:text-brand-secondary transition-colors cursor-pointer"
          >
            {t('preview.launch_anyway')}
          </button>
        </div>
      )}

      {/* Regenerate */}
      <div className="mt-8 pt-6 border-t border-divider">
        <p className="text-sm font-semibold text-heading mb-3 flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {t('preview.not_satisfied')}
        </p>
        <textarea
          value={refinementNote}
          onChange={(e) => setRefinementNote(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder={t('preview.refinement_placeholder')}
          aria-label={t('preview.refinement_aria')}
          className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint resize-none focus:outline-none focus:border-brand mb-3"
        />

        {regenError && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {regenError}
          </div>
        )}

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-6 py-2.5 rounded-xl border border-divider text-sm font-semibold text-muted hover:text-heading hover:border-brand/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {regenerating ? t('preview.regenerating') : t('preview.regenerate')}
        </button>
      </div>
    </div>
  );
}
