import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Flame, Heart, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useCustomSessions } from '../hooks/useCustomSessions.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useGenerateSession } from '../hooks/useGenerateSession.ts';
import type {
  BodyFocus,
  CustomSessionInput,
  CustomSessionMode,
  CustomSessionPreset,
  Intensity,
} from '../types/custom-session.ts';
import type { Equipment } from '../types/equipment.ts';
import { EQUIPMENT_OPTIONS } from '../types/equipment.ts';
import { toggleArrayElement } from '../utils/array.ts';

const PRESETS: { value: CustomSessionPreset; Icon: LucideIcon; label: string; desc: string }[] = [
  { value: 'transpirer', Icon: Flame, label: 'Objectif : transpirer', desc: 'HIIT + Tabata, haute intensité' },
  { value: 'renfo', Icon: Dumbbell, label: 'Renfo complet', desc: 'Renforcement musculaire structuré' },
  { value: 'express', Icon: Zap, label: 'Full body express', desc: 'Circuit rapide, zéro temps mort' },
  { value: 'mobilite', Icon: Heart, label: 'Détente & mobilité', desc: 'Stretching et récupération active' },
];

const DURATION_MIN = 10;
const DURATION_MAX = 90;
const DURATION_STEP = 5;

// EQUIPMENT_OPTIONS imported from types/equipment.ts

const INTENSITY_OPTIONS: { value: Intensity; label: string; color: string }[] = [
  { value: 'douce', label: 'Douce', color: 'bg-green-500' },
  { value: 'moderee', label: 'Modérée', color: 'bg-yellow-500' },
  { value: 'intense', label: 'Intense', color: 'bg-red-500' },
];

const BODY_FOCUS_OPTIONS: { value: BodyFocus; label: string }[] = [
  { value: 'upper', label: 'Haut du corps' },
  { value: 'lower', label: 'Bas du corps' },
  { value: 'core', label: 'Core' },
  { value: 'full', label: 'Full body' },
];

export function CustomSessionPage() {
  const { t, i18n } = useTranslation('sessions');
  useDocumentHead({ title: t('custom.page_title') });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { generate, loading, error } = useGenerateSession();
  const { sessions: history, loading: historyLoading, error: historyError, refresh } = useCustomSessions(user?.id);

  const [mode, setMode] = useState<CustomSessionMode>('quick');
  const [preset, setPreset] = useState<CustomSessionPreset>('transpirer');
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [intensity, setIntensity] = useState<Intensity>('moderee');
  const [bodyFocus, setBodyFocus] = useState<BodyFocus[]>([]);
  const [preferences, setPreferences] = useState('');

  const toggleChip = <T extends string>(arr: T[], val: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter(toggleArrayElement(arr, val));
  };

  const canSubmit = mode !== 'expert' || preferences.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const input: CustomSessionInput = {
      mode,
      duration,
      preferences: preferences.trim() || undefined,
      ...(mode === 'quick' ? { preset } : {}),
      ...(mode === 'detailed'
        ? {
            equipment: equipment.length > 0 ? equipment : undefined,
            intensity,
            bodyFocus: bodyFocus.length > 0 ? bodyFocus : undefined,
          }
        : {}),
    };

    const result = await generate(input);
    if (result) {
      refresh();
      navigate(`/seance/custom/${result.customSessionId}`);
    }
  };

  return (
    <div className="px-6 md:px-10 lg:px-14 pb-12 max-w-2xl mx-auto pt-6 md:pt-4">
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img
          src="/images/illustration-ai-session.webp"
          alt={t('custom.img_alt')}
          className="w-full h-32 sm:h-40 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
          {t('custom.heading')}
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-divider mb-6">
        {(
          [
            { value: 'quick', label: t('custom.mode_quick') },
            { value: 'detailed', label: t('custom.mode_detailed') },
            { value: 'expert', label: t('custom.mode_expert') },
          ] as const
        ).map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            aria-pressed={mode === m.value}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
              mode === m.value ? 'bg-brand text-white' : 'bg-surface-card text-muted hover:text-heading'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Expert mode */}
      {mode === 'expert' && (
        <div className="mb-6">
          <label htmlFor="preferences" className="text-sm font-semibold text-heading mb-2 block">
            {t('custom.expert_label')}
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder={t('custom.expert_placeholder')}
            className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint resize-none focus:outline-none focus:border-brand"
          />
          <p className="text-xs text-faint mt-1 text-right">{preferences.length}/2000</p>
        </div>
      )}

      {/* Quick mode: presets */}
      {mode === 'quick' && (
        <div className="space-y-3 mb-6">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPreset(p.value)}
              aria-pressed={preset === p.value}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors cursor-pointer ${
                preset === p.value ? 'border-brand bg-brand/10' : 'border-divider bg-surface-card hover:border-brand/30'
              }`}
            >
              <span className="inline-flex items-center mr-2">
                <p.Icon className="w-5 h-5 text-brand" aria-hidden="true" />
              </span>
              <span className="font-semibold text-heading">{p.label}</span>
              <p className="text-sm text-muted mt-0.5 ml-8">{p.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Detailed mode */}
      {mode === 'detailed' && (
        <div className="space-y-6 mb-6">
          {/* Equipment */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-2">{t('custom.equipment_legend')}</legend>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => toggleChip(equipment, e.value, setEquipment)}
                  aria-pressed={equipment.includes(e.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    equipment.includes(e.value)
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-divider text-muted hover:border-brand/30'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Intensity */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-2">{t('custom.intensity_legend')}</legend>
            <div className="flex gap-3">
              {INTENSITY_OPTIONS.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensity(i.value)}
                  aria-pressed={intensity === i.value}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                    intensity === i.value
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-divider text-muted hover:border-brand/30'
                  }`}
                >
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${i.color} mr-1.5`} aria-hidden="true" />
                  {i.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Body focus */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-2">{t('custom.body_focus_legend')}</legend>
            <div className="flex flex-wrap gap-2">
              {BODY_FOCUS_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => toggleChip(bodyFocus, f.value, setBodyFocus)}
                  aria-pressed={bodyFocus.includes(f.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    bodyFocus.includes(f.value)
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-divider text-muted hover:border-brand/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Preferences textarea — quick & detailed modes */}
      {mode !== 'expert' && (
        <div className="mb-6">
          <label htmlFor="preferences-extra" className="text-sm font-semibold text-heading mb-2 block">
            {t('custom.preferences_label')}
          </label>
          <textarea
            id="preferences-extra"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder={
              mode === 'quick'
                ? t('custom.preferences_placeholder_quick')
                : t('custom.preferences_placeholder_detailed')
            }
            className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint resize-none focus:outline-none focus:border-brand"
          />
          <p className="text-xs text-faint mt-1 text-right">{preferences.length}/2000</p>
        </div>
      )}

      {/* Duration stepper */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-heading mb-2">{t('custom.duration_legend')}</legend>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setDuration((d) => Math.max(DURATION_MIN, d - DURATION_STEP))}
            disabled={duration <= DURATION_MIN}
            aria-label={t('custom.duration_decrease_aria')}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &minus;
          </button>
          <span className="text-2xl font-bold text-heading tabular-nums min-w-[4rem] text-center">
            {duration}
            <span className="text-sm font-medium text-muted ml-1">min</span>
          </span>
          <button
            type="button"
            onClick={() => setDuration((d) => Math.min(DURATION_MAX, d + DURATION_STEP))}
            disabled={duration >= DURATION_MAX}
            aria-label={t('custom.duration_increase_aria')}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </fieldset>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="cta-gradient w-full py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('custom.generating') : t('custom.generate_cta')}
      </button>

      {/* Loading overlay */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-muted">{t('custom.ai_preparing')}</p>
        </div>
      )}

      {/* History error */}
      {historyError && (
        <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {historyError}
        </div>
      )}

      {/* History */}
      {!historyLoading && history.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-heading mb-4">{t('custom.history_title')}</h2>
          <div className="space-y-3">
            {history.map((s) => {
              const session = s.session_data;
              const date = new Date(s.created_at);
              const dateStr = date.toLocaleDateString(i18n.language, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              return (
                <div
                  key={s.id}
                  className="glass-card rounded-xl border border-card-border px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">{session.title}</p>
                    <p className="text-xs text-muted">
                      {t('custom.history_created', { date: dateStr })} &middot; ~{session.estimatedDuration} min
                    </p>
                  </div>
                  <Link
                    to={`/seance/custom/${s.id}`}
                    className="text-xs font-semibold text-brand hover:text-brand-secondary transition-colors shrink-0"
                  >
                    {t('custom.history_see')}
                  </Link>
                  <Link
                    to={`/seance/custom/${s.id}/play`}
                    className="text-xs font-semibold text-brand hover:text-brand-secondary transition-colors shrink-0"
                  >
                    {t('custom.history_replay')}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
