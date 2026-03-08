import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Dumbbell, Flame, Heart, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useCustomSessions } from '../hooks/useCustomSessions.ts';
import { useGenerateSession } from '../hooks/useGenerateSession.ts';
import type {
  BodyFocus,
  CustomSessionInput,
  CustomSessionMode,
  CustomSessionPreset,
  Equipment,
  Intensity,
} from '../types/custom-session.ts';

const PRESETS: { value: CustomSessionPreset; Icon: LucideIcon; label: string; desc: string }[] = [
  { value: 'transpirer', Icon: Flame, label: 'Objectif : transpirer', desc: 'HIIT + Tabata, haute intensité' },
  { value: 'renfo', Icon: Dumbbell, label: 'Renfo complet', desc: 'Renforcement musculaire structuré' },
  { value: 'express', Icon: Zap, label: 'Full body express', desc: 'Circuit rapide, zéro temps mort' },
  { value: 'mobilite', Icon: Heart, label: 'Détente & mobilité', desc: 'Stretching et récupération active' },
];

const DURATION_MIN = 10;
const DURATION_MAX = 90;
const DURATION_STEP = 5;

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'halteres', label: 'Haltères' },
  { value: 'elastiques', label: 'Élastiques' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'barre-musculation', label: 'Barre & disques' },
  { value: 'banc', label: 'Banc' },
  { value: 'barre-traction', label: 'Barre de traction' },
  { value: 'trx', label: 'TRX / Sangles' },
  { value: 'anneaux', label: 'Anneaux' },
  { value: 'corde-a-sauter', label: 'Corde à sauter' },
  { value: 'medecine-ball', label: 'Medicine ball' },
  { value: 'swiss-ball', label: 'Swiss ball' },
  { value: 'step', label: 'Step' },
  { value: 'tapis', label: 'Tapis' },
  { value: 'foam-roller', label: 'Foam roller' },
  { value: 'aucun', label: 'Sans matériel' },
];

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
  useDocumentHead({ title: 'Créer ma séance — WAN SHAPE' });

  const navigate = useNavigate();
  const { generate, loading, error } = useGenerateSession();
  const { sessions: history, loading: historyLoading, error: historyError, refresh } = useCustomSessions();

  const [mode, setMode] = useState<CustomSessionMode>('quick');
  const [preset, setPreset] = useState<CustomSessionPreset>('transpirer');
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [intensity, setIntensity] = useState<Intensity>('moderee');
  const [bodyFocus, setBodyFocus] = useState<BodyFocus[]>([]);
  const [preferences, setPreferences] = useState('');

  const toggleChip = <T extends string>(arr: T[], val: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
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
        <img src="/images/illustration-ai-session.webp" alt="Créer une séance personnalisée par IA" className="w-full h-32 sm:h-40 object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Créer ma séance</h1>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-divider mb-6">
        {([
          { value: 'quick', label: 'Rapide' },
          { value: 'detailed', label: 'Détaillé' },
          { value: 'expert', label: 'Expert' },
        ] as const).map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
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
            Décris ta séance
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder={'Ex : Séance push 45min, haltères + banc. 5min échauffement mobilité épaules. Bloc principal développé couché 5x5, développé incliné 3x10, élévations latérales 4x12. Finir avec un AMRAP 6min pompes/dips. Cooldown stretching pecs et épaules.'}
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
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors cursor-pointer ${
                preset === p.value
                  ? 'border-brand bg-brand/10'
                  : 'border-divider bg-surface-card hover:border-brand/30'
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
            <legend className="text-sm font-semibold text-heading mb-2">Équipement disponible</legend>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => toggleChip(equipment, e.value, setEquipment)}
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
            <legend className="text-sm font-semibold text-heading mb-2">Intensité</legend>
            <div className="flex gap-3">
              {INTENSITY_OPTIONS.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensity(i.value)}
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
            <legend className="text-sm font-semibold text-heading mb-2">Zones ciblées</legend>
            <div className="flex flex-wrap gap-2">
              {BODY_FOCUS_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => toggleChip(bodyFocus, f.value, setBodyFocus)}
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
            Précisions
          </label>
          <textarea
            id="preferences-extra"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder={
              mode === 'quick'
                ? 'Optionnel : pas de burpees, focus épaules, niveau débutant...'
                : 'Optionnel : contraintes, objectifs, exercices préférés...'
            }
            className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint resize-none focus:outline-none focus:border-brand"
          />
          <p className="text-xs text-faint mt-1 text-right">{preferences.length}/2000</p>
        </div>
      )}

      {/* Duration stepper */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-heading mb-2">Durée</legend>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setDuration((d) => Math.max(DURATION_MIN, d - DURATION_STEP))}
            disabled={duration <= DURATION_MIN}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &minus;
          </button>
          <span className="text-2xl font-bold text-heading tabular-nums min-w-[4rem] text-center">
            {duration}<span className="text-sm font-medium text-muted ml-1">min</span>
          </span>
          <button
            type="button"
            onClick={() => setDuration((d) => Math.min(DURATION_MAX, d + DURATION_STEP))}
            disabled={duration >= DURATION_MAX}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </fieldset>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="cta-gradient w-full py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Génération en cours...' : 'Générer ma séance'}
      </button>

      {/* Loading overlay */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-muted">L'IA prépare votre séance...</p>
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
          <h2 className="text-lg font-bold text-heading mb-4">Mes séances précédentes</h2>
          <div className="space-y-3">
            {history.map((s) => {
              const session = s.session_data;
              const date = new Date(s.created_at);
              const dateStr = date.toLocaleDateString('fr-FR', {
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
                      {dateStr} &middot; ~{session.estimatedDuration} min
                    </p>
                  </div>
                  <Link
                    to={`/seance/custom/${s.id}`}
                    className="text-xs font-semibold text-brand hover:text-brand-secondary transition-colors shrink-0"
                  >
                    Voir
                  </Link>
                  <Link
                    to={`/seance/custom/${s.id}/play`}
                    className="text-xs font-semibold text-brand hover:text-brand-secondary transition-colors shrink-0"
                  >
                    Rejouer
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
