import type { RefObject } from 'react';
import type { Materiel } from '../../types/custom-program.ts';
import { MATERIEL_OPTIONS, DUREE_OPTIONS } from './formOptions.ts';

export interface StepPreferencesProps {
  seancesParSemaine: number;
  maxSeances: number;
  dureeSeanceMinutes: number;
  materiel: (Materiel | 'salle')[];
  materielDetail: string;
  dureeSemaines: 4 | 8 | 12;
  isValid: boolean;
  generating: boolean;
  generateError: string | null;
  stepHeadingRef: RefObject<HTMLHeadingElement | null>;
  onChangeSeances: (value: number) => void;
  onChangeDureeSeance: (value: number) => void;
  onToggleMateriel: (value: Materiel | 'salle') => void;
  onChangeMaterielDetail: (value: string) => void;
  onChangeDureeSemaines: (value: 4 | 8 | 12) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepPreferences({
  seancesParSemaine,
  maxSeances,
  dureeSeanceMinutes,
  materiel,
  materielDetail,
  dureeSemaines,
  isValid,
  generating,
  generateError,
  stepHeadingRef,
  onChangeSeances,
  onChangeDureeSeance,
  onToggleMateriel,
  onChangeMaterielDetail,
  onChangeDureeSemaines,
  onBack,
  onSubmit,
}: StepPreferencesProps) {
  return (
    <div className="space-y-6">
      <h1 ref={stepHeadingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-heading outline-none">
        Configure ton programme
      </h1>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-2">Séances par semaine</legend>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChangeSeances(Math.max(2, seancesParSemaine - 1))}
            disabled={seancesParSemaine <= 2}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &minus;
          </button>
          <span className="text-2xl font-bold text-heading tabular-nums min-w-[3rem] text-center">
            {seancesParSemaine}
          </span>
          <button
            type="button"
            onClick={() => onChangeSeances(Math.min(maxSeances, seancesParSemaine + 1))}
            disabled={seancesParSemaine >= maxSeances}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        {maxSeances < 5 && (
          <p className="text-xs text-faint mt-1">Adapté à ton rythme actuel</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-2">Durée par séance</legend>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChangeDureeSeance(Math.max(30, dureeSeanceMinutes - 5))}
            disabled={dureeSeanceMinutes <= 30}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &minus;
          </button>
          <span className="text-2xl font-bold text-heading tabular-nums min-w-[5rem] text-center">
            {dureeSeanceMinutes}<span className="text-sm font-medium text-muted ml-1">min</span>
          </span>
          <button
            type="button"
            onClick={() => onChangeDureeSeance(Math.min(75, dureeSeanceMinutes + 5))}
            disabled={dureeSeanceMinutes >= 75}
            className="w-10 h-10 rounded-full border border-divider text-heading font-bold text-lg flex items-center justify-center cursor-pointer hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-3">Matériel disponible</legend>
        <div className="flex flex-wrap gap-2" role="group">
          {MATERIEL_OPTIONS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onToggleMateriel(m.value)}
              aria-pressed={materiel.includes(m.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                materiel.includes(m.value)
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
          value={materielDetail}
          onChange={(e) => onChangeMaterielDetail(e.target.value)}
          maxLength={100}
          placeholder="Autre matériel ? (optionnel)"
          className="mt-3 w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint focus:outline-none focus:border-brand"
        />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-3">Durée du programme</legend>
        <div className="grid grid-cols-3 gap-3">
          {DUREE_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onChangeDureeSemaines(d.value)}
              className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer relative ${
                dureeSemaines === d.value
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

      {generateError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {generateError}
        </div>
      )}

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
          onClick={onSubmit}
          disabled={!isValid || generating}
          className="flex-1 cta-gradient py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Générer mon programme
        </button>
      </div>
    </div>
  );
}
