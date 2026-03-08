import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ClipboardList } from 'lucide-react';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useGenerateProgram } from '../hooks/useGenerateProgram.ts';
import { useUserPrograms } from '../hooks/useUserPrograms.ts';
import type {
  ExperienceDuree,
  FrequenceActuelle,
  Materiel,
  ProgramOnboardingInput,
} from '../types/custom-program.ts';

const DRAFT_KEY = 'wan-shape-create-program-draft';
const MAX_ACTIVE = 3;

const OBJECTIF_OPTIONS = [
  { value: 'perte_poids', label: 'Perte de poids' },
  { value: 'prise_muscle', label: 'Prise de muscle' },
  { value: 'remise_forme', label: 'Remise en forme' },
  { value: 'force', label: 'Force' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'performance_sportive', label: 'Performance sportive' },
  { value: 'bien_etre', label: 'Bien-être' },
  { value: 'souplesse', label: 'Souplesse' },
];

const EXPERIENCE_OPTIONS: { value: ExperienceDuree; label: string; desc: string }[] = [
  { value: 'debutant', label: 'Débutant', desc: 'Moins de 6 mois' },
  { value: 'six_mois_deux_ans', label: '6 mois - 2 ans', desc: 'Pratique régulière' },
  { value: 'plus_deux_ans', label: '+2 ans', desc: 'Expérimenté' },
];

const FREQUENCE_OPTIONS: { value: FrequenceActuelle; label: string }[] = [
  { value: 'jamais', label: 'Jamais' },
  { value: 'une_deux', label: '1-2x / sem' },
  { value: 'trois_quatre', label: '3-4x / sem' },
  { value: 'cinq_plus', label: '5+ / sem' },
];

const BLESSURE_OPTIONS = [
  { value: 'genou', label: 'Genou' },
  { value: 'dos', label: 'Dos / Lombaires' },
  { value: 'epaule', label: 'Épaule' },
  { value: 'cheville', label: 'Cheville' },
  { value: 'poignet', label: 'Poignet' },
  { value: 'cervicales', label: 'Cervicales' },
  { value: 'hanche', label: 'Hanche' },
  { value: 'autre', label: 'Autre' },
];

const MATERIEL_OPTIONS: { value: Materiel | 'salle'; label: string }[] = [
  { value: 'poids_du_corps', label: 'Poids du corps' },
  { value: 'halteres', label: 'Haltères' },
  { value: 'barre_disques', label: 'Barre & disques' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'elastiques', label: 'Élastiques' },
  { value: 'banc', label: 'Banc' },
  { value: 'barre_traction', label: 'Barre de traction' },
  { value: 'trx', label: 'TRX / Sangles' },
  { value: 'corde_a_sauter', label: 'Corde à sauter' },
  { value: 'medecine_ball', label: 'Medicine ball' },
  { value: 'salle', label: 'Salle de sport (machines)' },
];

const DUREE_OPTIONS: { value: 4 | 8 | 12; label: string; recommended?: boolean }[] = [
  { value: 4, label: '4 semaines' },
  { value: 8, label: '8 semaines', recommended: true },
  { value: 12, label: '12 semaines' },
];

const LOADING_PHASES = [
  { text: 'Analyse de ton profil...', duration: 5000 },
  { text: 'Conception des séances...', duration: 20000 },
  { text: 'Planification du calendrier...', duration: 10000 },
  { text: 'Dernières vérifications...', duration: 10000 },
];

interface DraftState {
  step: number;
  objectifs: string[];
  objectif_detail: string;
  experience_duree: ExperienceDuree | '';
  frequence_actuelle: FrequenceActuelle | '';
  blessures: string[];
  blessure_detail: string;
  age: string;
  sexe: string;
  seances_par_semaine: number;
  duree_seance_minutes: number;
  materiel: (Materiel | 'salle')[];
  materiel_detail: string;
  duree_semaines: 4 | 8 | 12;
}

const DEFAULT_DRAFT: DraftState = {
  step: 1,
  objectifs: [],
  objectif_detail: '',
  experience_duree: '',
  frequence_actuelle: '',
  blessures: [],
  blessure_detail: '',
  age: '',
  sexe: '',
  seances_par_semaine: 3,
  duree_seance_minutes: 45,
  materiel: [],
  materiel_detail: '',
  duree_semaines: 8,
};

export function CreateProgramPage() {
  useDocumentHead({ title: 'Créer mon programme — WAN SHAPE' });

  const navigate = useNavigate();
  const { generate, loading: generating, error: generateError } = useGenerateProgram();
  const { programs: userPrograms, loading: programsLoading } = useUserPrograms();

  const [draft, setDraft] = useState<DraftState>({ ...DEFAULT_DRAFT });
  const [loadingPhase, setLoadingPhase] = useState(0);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  // Clear any stale draft on mount
  useEffect(() => {
    sessionStorage.removeItem(DRAFT_KEY);
  }, []);

  // Focus heading on step change
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [draft.step]);

  // Loading phase animation
  useEffect(() => {
    if (!generating) {
      setLoadingPhase(0);
      return;
    }

    let elapsed = 0;
    let phase = 0;
    const interval = setInterval(() => {
      elapsed += 1000;
      let cumulative = 0;
      for (let i = 0; i < LOADING_PHASES.length; i++) {
        cumulative += LOADING_PHASES[i].duration;
        if (elapsed < cumulative) { phase = i; break; }
        if (i === LOADING_PHASES.length - 1) phase = i;
      }
      setLoadingPhase(phase);
    }, 1000);

    return () => clearInterval(interval);
  }, [generating]);

  // Prevent accidental close during generation
  useEffect(() => {
    if (!generating) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [generating]);

  const update = useCallback(<K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleChip = <T extends string>(arr: T[], val: T, key: keyof DraftState) => {
    const newArr = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
    update(key, newArr as DraftState[typeof key]);
  };

  const goToStep = (step: number) => update('step', step);

  // Validation
  const isStep1Valid = draft.objectifs.length > 0;
  const isStep2Valid = draft.experience_duree !== '' && draft.frequence_actuelle !== '';
  const isStep3Valid = draft.materiel.length > 0;

  // Cap seances for beginners
  const maxSeances = ['jamais', 'une_deux'].includes(draft.frequence_actuelle) ? 3 : 5;
  const effectiveSeances = Math.min(draft.seances_par_semaine, maxSeances);

  const handleSubmit = async () => {
    if (!isStep3Valid) return;

    // Build objectif_detail: append materiel_detail if present
    let detailParts = draft.objectif_detail || '';
    if (draft.materiel_detail) {
      detailParts = detailParts
        ? `${detailParts}\nMateriel supplementaire : ${draft.materiel_detail}`
        : `Materiel supplementaire : ${draft.materiel_detail}`;
    }
    if (draft.materiel.includes('salle')) {
      detailParts = detailParts
        ? `${detailParts}\nAcces a une salle de sport avec machines.`
        : 'Acces a une salle de sport avec machines.';
    }

    const input: ProgramOnboardingInput = {
      objectifs: draft.objectifs,
      objectif_detail: detailParts || undefined,
      experience_duree: draft.experience_duree as ExperienceDuree,
      frequence_actuelle: draft.frequence_actuelle as FrequenceActuelle,
      blessures: draft.blessures.filter((b) => b !== 'autre'),
      blessure_detail: draft.blessure_detail || undefined,
      age: draft.age ? parseInt(draft.age) : undefined,
      sexe: (draft.sexe as ProgramOnboardingInput['sexe']) || undefined,
      seances_par_semaine: effectiveSeances,
      duree_seance_minutes: draft.duree_seance_minutes,
      materiel: (() => {
        const filtered = draft.materiel.filter((m): m is Materiel => m !== 'salle');
        // Si seulement "salle" est selectionne, on envoie l'equipement typique
        if (filtered.length === 0 && draft.materiel.includes('salle'))
          return ['halteres', 'barre_disques', 'banc', 'elastiques'] as Materiel[];
        return filtered;
      })(),
      duree_semaines: draft.duree_semaines,
    };

    const result = await generate(input);
    if (result) {
      sessionStorage.removeItem(DRAFT_KEY);
      navigate(`/programme/${result.slug}/suivi`);
    }
  };

  // Check active programs limit
  const atLimit = !programsLoading && userPrograms.length >= MAX_ACTIVE;

  if (atLimit) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center space-y-6">
        <ClipboardList className="w-12 h-12 text-muted mx-auto" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-heading">Limite atteinte</h1>
        <p className="text-muted">
          Tu as déjà {MAX_ACTIVE} programmes actifs. Supprime un programme existant pour en créer un nouveau.
        </p>
        <Link
          to="/programmes"
          className="inline-block cta-gradient px-8 py-3.5 rounded-full text-sm font-bold text-white"
        >
          Voir mes programmes
        </Link>
      </div>
    );
  }

  // Loading overlay
  if (generating) {
    const progressPct = Math.min(95, ((loadingPhase + 1) / LOADING_PHASES.length) * 100);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/95 backdrop-blur-sm" role="status" aria-live="polite">
        <div className="text-center space-y-6 px-6 max-w-sm">
          <div className="w-12 h-12 border-3 border-divider-strong border-t-brand rounded-full animate-spin mx-auto" />
          <p className="text-lg font-semibold text-heading">{LOADING_PHASES[loadingPhase].text}</p>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-secondary transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-faint">Estimation : 30-60 secondes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 pb-12">
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img src="/images/illustration-program.webp" alt="Créer un programme sportif personnalisé" className="w-full h-32 sm:h-40 object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 font-display text-2xl sm:text-3xl font-black text-white drop-shadow-sm">Créer mon programme</h1>
      </div>

      {/* Step indicator */}
      <nav aria-label={`Étape ${draft.step} sur 3`} className="flex items-center gap-1 mb-8">
        {([
          { n: 1, label: 'Objectif' },
          { n: 2, label: 'Profil' },
          { n: 3, label: 'Programme' },
        ] as const).map(({ n, label }) => {
          const canGo =
            n < draft.step ||
            (n === 2 && isStep1Valid) ||
            (n === 3 && isStep1Valid && isStep2Valid);
          return (
            <button
              key={n}
              type="button"
              onClick={() => canGo && goToStep(n)}
              disabled={!canGo && n !== draft.step}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                canGo || n === draft.step ? 'cursor-pointer' : 'cursor-default opacity-40'
              }`}
              aria-label={`Étape ${n} : ${label}`}
              aria-current={n === draft.step ? 'step' : undefined}
            >
              <span className={`text-xs font-semibold ${n <= draft.step ? 'text-brand' : 'text-muted'}`}>
                {label}
              </span>
              <span className={`w-full h-1.5 rounded-full transition-colors ${
                n <= draft.step ? 'bg-brand' : 'bg-divider'
              }`} />
            </button>
          );
        })}
      </nav>

      {/* Step 1 — Objectif */}
      {draft.step === 1 && (
        <div className="space-y-6">
          <h1 ref={stepHeadingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-heading outline-none">
            Qu'est-ce qui te motive ?
          </h1>

          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-3">Choisis tes objectifs</legend>
            <div className="flex flex-wrap gap-2" role="group">
              {OBJECTIF_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleChip(draft.objectifs, o.value, 'objectifs')}
                  aria-pressed={draft.objectifs.includes(o.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    draft.objectifs.includes(o.value)
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-divider text-muted hover:border-brand/30'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="objectif-detail" className="text-sm font-semibold text-heading mb-1 block">
              Dis-nous en plus
            </label>
            <p className="text-xs text-muted mb-2">Plus tu précises, plus ton programme sera adapté.</p>
            <textarea
              id="objectif-detail"
              value={draft.objectif_detail}
              onChange={(e) => update('objectif_detail', e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Ex : perdre 5kg avant l'été, pré-saison foot, programme en parallèle du basket pour performer le week-end..."
              className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint resize-none focus:outline-none focus:border-brand"
            />
          </div>

          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={!isStep1Valid}
            className="cta-gradient w-full py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Step 2 — Situation */}
      {draft.step === 2 && (
        <div className="space-y-6">
          <h1 ref={stepHeadingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-heading outline-none">
            Parle-nous de toi
          </h1>

          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-3">Expérience sportive</legend>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_OPTIONS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => update('experience_duree', e.value)}
                  className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    draft.experience_duree === e.value
                      ? 'border-brand bg-brand/10'
                      : 'border-divider hover:border-brand/30'
                  }`}
                >
                  <span className="block text-sm font-semibold text-heading">{e.label}</span>
                  <span className="block text-xs text-muted mt-0.5">{e.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-3">Fréquence actuelle</legend>
            <div className="grid grid-cols-2 gap-3">
              {FREQUENCE_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => update('frequence_actuelle', f.value)}
                  className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    draft.frequence_actuelle === f.value
                      ? 'border-brand bg-brand/10'
                      : 'border-divider hover:border-brand/30'
                  }`}
                >
                  <span className="text-sm font-semibold text-heading">{f.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-3">Blessures / sensibilités</legend>
            <div className="flex flex-wrap gap-2" role="group">
              {BLESSURE_OPTIONS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => toggleChip(draft.blessures, b.value, 'blessures')}
                  aria-pressed={draft.blessures.includes(b.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    draft.blessures.includes(b.value)
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-divider text-muted hover:border-brand/30'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            {draft.blessures.includes('autre') && (
              <input
                type="text"
                value={draft.blessure_detail}
                onChange={(e) => update('blessure_detail', e.target.value)}
                maxLength={300}
                placeholder="Précise ta blessure..."
                className="mt-3 w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint focus:outline-none focus:border-brand"
              />
            )}
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="text-sm font-semibold text-heading mb-2 block">
                Age (optionnel)
              </label>
              <input
                id="age"
                type="number"
                min={14}
                max={99}
                value={draft.age}
                onChange={(e) => update('age', e.target.value)}
                placeholder="Ex : 30"
                className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="sexe" className="text-sm font-semibold text-heading mb-2 block">
                Sexe (optionnel)
              </label>
              <select
                id="sexe"
                value={draft.sexe}
                onChange={(e) => update('sexe', e.target.value)}
                className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading focus:outline-none focus:border-brand"
              >
                <option value="">-</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-faint">
            Ces infos permettent d'affiner le programme — elles restent privées.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex-1 py-4 rounded-xl text-sm font-bold border border-divider text-muted hover:text-heading transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              disabled={!isStep2Valid}
              className="flex-1 cta-gradient py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Programme */}
      {draft.step === 3 && (
        <div className="space-y-6">
          <h1 ref={stepHeadingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-heading outline-none">
            Configure ton programme
          </h1>

          {/* Seances par semaine */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-2">Séances par semaine</legend>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => update('seances_par_semaine', Math.max(2, effectiveSeances - 1))}
                disabled={effectiveSeances <= 2}
                className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &minus;
              </button>
              <span className="text-2xl font-bold text-heading tabular-nums min-w-[3rem] text-center">
                {effectiveSeances}
              </span>
              <button
                type="button"
                onClick={() => update('seances_par_semaine', Math.min(maxSeances, effectiveSeances + 1))}
                disabled={effectiveSeances >= maxSeances}
                className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {maxSeances < 5 && (
              <p className="text-xs text-faint mt-1">Adapté à ton rythme actuel</p>
            )}
          </fieldset>

          {/* Duree par seance */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-2">Durée par séance</legend>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => update('duree_seance_minutes', Math.max(30, draft.duree_seance_minutes - 5))}
                disabled={draft.duree_seance_minutes <= 30}
                className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &minus;
              </button>
              <span className="text-2xl font-bold text-heading tabular-nums min-w-[5rem] text-center">
                {draft.duree_seance_minutes}<span className="text-sm font-medium text-muted ml-1">min</span>
              </span>
              <button
                type="button"
                onClick={() => update('duree_seance_minutes', Math.min(75, draft.duree_seance_minutes + 5))}
                disabled={draft.duree_seance_minutes >= 75}
                className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </fieldset>

          {/* Materiel */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-3">Matériel disponible</legend>
            <div className="flex flex-wrap gap-2" role="group">
              {MATERIEL_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleChip(draft.materiel, m.value, 'materiel')}
                  aria-pressed={draft.materiel.includes(m.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    draft.materiel.includes(m.value)
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-divider text-muted hover:border-brand/30'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={draft.materiel_detail}
              onChange={(e) => update('materiel_detail', e.target.value)}
              maxLength={100}
              placeholder="Autre matériel ? (optionnel)"
              className="mt-3 w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint focus:outline-none focus:border-brand"
            />
          </fieldset>

          {/* Duree programme */}
          <fieldset>
            <legend className="text-sm font-semibold text-heading mb-3">Durée du programme</legend>
            <div className="grid grid-cols-3 gap-3">
              {DUREE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => update('duree_semaines', d.value)}
                  className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer relative ${
                    draft.duree_semaines === d.value
                      ? 'border-brand bg-brand/10'
                      : 'border-divider hover:border-brand/30'
                  }`}
                >
                  <span className="text-sm font-semibold text-heading">{d.label}</span>
                  {d.recommended && (
                    <span className="block text-xs text-brand mt-0.5">Recommandé</span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Error */}
          {generateError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {generateError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="flex-1 py-4 rounded-xl text-sm font-bold border border-divider text-muted hover:text-heading transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStep3Valid || generating}
              className="flex-1 cta-gradient py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Générer mon programme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
