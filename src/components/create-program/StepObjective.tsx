import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { OBJECTIF_OPTIONS } from './formOptions.ts';

export interface StepObjectiveProps {
  objectifs: string[];
  objectifDetail: string;
  isValid: boolean;
  stepHeadingRef: RefObject<HTMLHeadingElement | null>;
  onToggleObjectif: (value: string) => void;
  onChangeDetail: (value: string) => void;
  onNext: () => void;
}

export function StepObjective({
  objectifs,
  objectifDetail,
  isValid,
  stepHeadingRef,
  onToggleObjectif,
  onChangeDetail,
  onNext,
}: StepObjectiveProps) {
  const { t } = useTranslation('programs');
  return (
    <div className="space-y-6">
      <h1 ref={stepHeadingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-heading outline-none">
        {t('step_objective.title')}
      </h1>

      <fieldset>
        <legend className="text-sm font-semibold text-heading mb-3">{t('step_objective.legend')}</legend>
        <div className="flex flex-wrap gap-2">
          {OBJECTIF_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggleObjectif(o.value)}
              aria-pressed={objectifs.includes(o.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                objectifs.includes(o.value)
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-divider text-muted hover:border-brand/30'
              }`}
            >
              {t(`objectif.${o.value}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="objectif-detail" className="text-sm font-semibold text-heading mb-1 block">
          {t('step_objective.detail_label')}
        </label>
        <p className="text-xs text-muted mb-2">{t('step_objective.detail_hint')}</p>
        <textarea
          id="objectif-detail"
          value={objectifDetail}
          onChange={(e) => onChangeDetail(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder={t('step_objective.detail_placeholder')}
          className="w-full rounded-xl border border-divider bg-surface-card px-4 py-3 text-sm text-heading placeholder:text-faint resize-none focus:outline-none focus:border-brand"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!isValid}
        className="cta-gradient w-full py-4 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('step_objective.next')}
      </button>
    </div>
  );
}
