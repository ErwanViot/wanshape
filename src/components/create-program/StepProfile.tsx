import type { RefObject } from 'react';
import type { ExperienceDuree, FrequenceActuelle } from '../../types/custom-program.ts';
import { EXPERIENCE_OPTIONS, FREQUENCE_OPTIONS, BLESSURE_OPTIONS } from './formOptions.ts';

export interface StepProfileProps {
  experienceDuree: ExperienceDuree | '';
  frequenceActuelle: FrequenceActuelle | '';
  blessures: string[];
  blessureDetail: string;
  age: string;
  sexe: string;
  isValid: boolean;
  stepHeadingRef: RefObject<HTMLHeadingElement | null>;
  onChangeExperience: (value: ExperienceDuree) => void;
  onChangeFrequence: (value: FrequenceActuelle) => void;
  onToggleBlessure: (value: string) => void;
  onChangeBlessureDetail: (value: string) => void;
  onChangeAge: (value: string) => void;
  onChangeSexe: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepProfile({
  experienceDuree,
  frequenceActuelle,
  blessures,
  blessureDetail,
  age,
  sexe,
  isValid,
  stepHeadingRef,
  onChangeExperience,
  onChangeFrequence,
  onToggleBlessure,
  onChangeBlessureDetail,
  onChangeAge,
  onChangeSexe,
  onBack,
  onNext,
}: StepProfileProps) {
  return (
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
              onClick={() => onChangeExperience(e.value)}
              aria-pressed={experienceDuree === e.value}
              className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                experienceDuree === e.value
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
              onClick={() => onChangeFrequence(f.value)}
              aria-pressed={frequenceActuelle === f.value}
              className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                frequenceActuelle === f.value
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
              onClick={() => onToggleBlessure(b.value)}
              aria-pressed={blessures.includes(b.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                blessures.includes(b.value)
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-divider text-muted hover:border-brand/30'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        {blessures.includes('autre') && (
          <input
            type="text"
            value={blessureDetail}
            onChange={(e) => onChangeBlessureDetail(e.target.value)}
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
            min={18}
            max={99}
            value={age}
            onChange={(e) => onChangeAge(e.target.value)}
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
            value={sexe}
            onChange={(e) => onChangeSexe(e.target.value)}
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
          onClick={onBack}
          className="flex-1 py-4 rounded-xl text-sm font-bold border border-divider text-muted hover:text-heading transition-colors cursor-pointer"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 cta-gradient py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
