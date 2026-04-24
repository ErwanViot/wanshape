import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExperienceDuree, FrequenceActuelle } from '../../types/custom-program.ts';
import { BLESSURE_OPTIONS, EXPERIENCE_OPTIONS, FREQUENCE_OPTIONS } from './formOptions.ts';

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
  const { t } = useTranslation('programs');
  return (
    <div className="space-y-6">
      <h1 ref={stepHeadingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-heading outline-none">
        {t('step_profile.title')}
      </h1>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-3">{t('step_profile.experience_legend')}</legend>
        <div className="grid grid-cols-3 gap-3">
          {EXPERIENCE_OPTIONS.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => onChangeExperience(e.value)}
              aria-pressed={experienceDuree === e.value}
              className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                experienceDuree === e.value ? 'border-brand bg-brand/10' : 'border-divider hover:border-brand/30'
              }`}
            >
              <span className="block text-sm font-semibold text-heading">{t(`experience.${e.value}`)}</span>
              <span className="block text-xs text-muted mt-0.5">{t(`experience_desc.${e.value}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-3">{t('step_profile.frequency_legend')}</legend>
        <div className="grid grid-cols-2 gap-3">
          {FREQUENCE_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onChangeFrequence(f.value)}
              aria-pressed={frequenceActuelle === f.value}
              className={`px-3 py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                frequenceActuelle === f.value ? 'border-brand bg-brand/10' : 'border-divider hover:border-brand/30'
              }`}
            >
              <span className="text-sm font-semibold text-heading">{t(`frequence.${f.value}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-3">{t('step_profile.injuries_legend')}</legend>
        <div className="flex flex-wrap gap-2">
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
              {t(`blessure.${b.value}`)}
            </button>
          ))}
        </div>
        {blessures.includes('autre') && (
          <input
            type="text"
            value={blessureDetail}
            onChange={(e) => onChangeBlessureDetail(e.target.value)}
            maxLength={300}
            placeholder={t('step_profile.injury_detail_placeholder')}
            className="mt-3 w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint focus:outline-none focus:border-brand"
          />
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="text-sm font-semibold text-heading mb-2 block">
            {t('step_profile.age_label')}
          </label>
          <input
            id="age"
            type="number"
            min={18}
            max={99}
            value={age}
            onChange={(e) => onChangeAge(e.target.value)}
            placeholder={t('step_profile.age_placeholder')}
            className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="sexe" className="text-sm font-semibold text-heading mb-2 block">
            {t('step_profile.sex_label')}
          </label>
          <select
            id="sexe"
            value={sexe}
            onChange={(e) => onChangeSexe(e.target.value)}
            className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading focus:outline-none focus:border-brand"
          >
            <option value="">-</option>
            <option value="homme">{t('step_profile.sex_male')}</option>
            <option value="femme">{t('step_profile.sex_female')}</option>
            <option value="autre">{t('step_profile.sex_other')}</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-faint">{t('step_profile.privacy_note')}</p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-xl text-sm font-bold border border-divider text-muted hover:text-heading transition-colors cursor-pointer"
        >
          {t('step_profile.back')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 cta-gradient py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('step_profile.next')}
        </button>
      </div>
    </div>
  );
}
