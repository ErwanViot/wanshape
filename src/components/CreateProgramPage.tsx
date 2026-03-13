import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ClipboardList } from 'lucide-react';
import { STORAGE_KEYS } from '../config/storage-keys.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useGenerateProgram } from '../hooks/useGenerateProgram.ts';
import { useUserPrograms } from '../hooks/useUserPrograms.ts';
import { toggleArrayElement } from '../utils/array.ts';
import type {
  ExperienceDuree,
  FrequenceActuelle,
  ProgramOnboardingInput,
} from '../types/custom-program.ts';
import type { Equipment } from '../types/equipment.ts';
import { LOADING_PHASES } from './create-program/formOptions.ts';
import { StepObjective } from './create-program/StepObjective.tsx';
import { StepProfile } from './create-program/StepProfile.tsx';
import { StepPreferences } from './create-program/StepPreferences.tsx';
import { GeneratingOverlay } from './create-program/GeneratingOverlay.tsx';

const MAX_ACTIVE = 3;

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
  materiel: (Equipment | 'salle')[];
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
  useDocumentHead({ title: 'Créer mon programme — Wan2Fit' });

  const navigate = useNavigate();
  const { generate, loading: generating, error: generateError } = useGenerateProgram();
  const { programs: userPrograms, loading: programsLoading } = useUserPrograms();

  const [draft, setDraft] = useState<DraftState>({ ...DEFAULT_DRAFT });
  const [loadingPhase, setLoadingPhase] = useState(0);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEYS.CREATE_PROGRAM_DRAFT);
  }, []);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [draft.step]);

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
    update(key, toggleArrayElement(arr, val) as DraftState[typeof key]);
  };

  const goToStep = (step: number) => update('step', step);

  const isStep1Valid = draft.objectifs.length > 0;
  const isStep2Valid = draft.experience_duree !== '' && draft.frequence_actuelle !== '';
  const isStep3Valid = draft.materiel.length > 0;

  const maxSeances = ['jamais', 'une_deux'].includes(draft.frequence_actuelle) ? 3 : 5;
  const effectiveSeances = Math.min(draft.seances_par_semaine, maxSeances);

  const handleSubmit = async () => {
    if (!isStep3Valid) return;

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
        const filtered = draft.materiel.filter((m): m is Equipment => m !== 'salle');
        if (filtered.length === 0 && draft.materiel.includes('salle'))
          return ['halteres', 'barre_disques', 'banc', 'elastiques'] as Equipment[];
        return filtered;
      })(),
      duree_semaines: draft.duree_semaines,
    };

    const result = await generate(input);
    if (result) {
      sessionStorage.removeItem(STORAGE_KEYS.CREATE_PROGRAM_DRAFT);
      navigate(`/programme/${result.slug}/suivi`);
    }
  };

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

  if (generating) {
    return <GeneratingOverlay phase={loadingPhase} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 pb-12">
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img src="/images/illustration-program.webp" alt="Créer un programme sportif personnalisé" className="w-full h-32 sm:h-40 object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 font-display text-2xl sm:text-3xl font-black text-white drop-shadow-sm">Créer mon programme</h1>
      </div>

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

      {draft.step === 1 && (
        <StepObjective
          objectifs={draft.objectifs}
          objectifDetail={draft.objectif_detail}
          isValid={isStep1Valid}
          stepHeadingRef={stepHeadingRef}
          onToggleObjectif={(val) => toggleChip(draft.objectifs, val, 'objectifs')}
          onChangeDetail={(val) => update('objectif_detail', val)}
          onNext={() => goToStep(2)}
        />
      )}

      {draft.step === 2 && (
        <StepProfile
          experienceDuree={draft.experience_duree}
          frequenceActuelle={draft.frequence_actuelle}
          blessures={draft.blessures}
          blessureDetail={draft.blessure_detail}
          age={draft.age}
          sexe={draft.sexe}
          isValid={isStep2Valid}
          stepHeadingRef={stepHeadingRef}
          onChangeExperience={(val) => update('experience_duree', val)}
          onChangeFrequence={(val) => update('frequence_actuelle', val)}
          onToggleBlessure={(val) => toggleChip(draft.blessures, val, 'blessures')}
          onChangeBlessureDetail={(val) => update('blessure_detail', val)}
          onChangeAge={(val) => update('age', val)}
          onChangeSexe={(val) => update('sexe', val)}
          onBack={() => goToStep(1)}
          onNext={() => goToStep(3)}
        />
      )}

      {draft.step === 3 && (
        <StepPreferences
          seancesParSemaine={effectiveSeances}
          maxSeances={maxSeances}
          dureeSeanceMinutes={draft.duree_seance_minutes}
          materiel={draft.materiel}
          materielDetail={draft.materiel_detail}
          dureeSemaines={draft.duree_semaines}
          isValid={isStep3Valid}
          generating={generating}
          generateError={generateError}
          stepHeadingRef={stepHeadingRef}
          onChangeSeances={(val) => update('seances_par_semaine', val)}
          onChangeDureeSeance={(val) => update('duree_seance_minutes', val)}
          onToggleMateriel={(val) => toggleChip(draft.materiel, val, 'materiel')}
          onChangeMaterielDetail={(val) => update('materiel_detail', val)}
          onChangeDureeSemaines={(val) => update('duree_semaines', val)}
          onBack={() => goToStep(2)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
