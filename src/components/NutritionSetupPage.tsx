import { ArrowLeft, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useNutritionProfile } from '../hooks/useNutritionProfile.ts';
import type { ActivityLevel, NutritionGoal, TdeeResult } from '../types/nutrition.ts';
import { TdeeCalculatorForm } from './nutrition/TdeeCalculatorForm.tsx';

export function NutritionSetupPage() {
  const { t } = useTranslation('nutrition');
  useDocumentHead({
    title: t('setup.title'),
    description: t('setup.description'),
  });

  const navigate = useNavigate();
  const { profile, loading, upsert, clearTarget } = useNutritionProfile();
  const [manualTarget, setManualTarget] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.target_calories != null && manualTarget === '') {
      setManualTarget(String(profile.target_calories));
    }
  }, [profile?.target_calories, manualTarget]);

  async function handleTdeeAccept(result: TdeeResult, activityLevel: ActivityLevel, goal: NutritionGoal) {
    await upsert({
      target_calories: result.targetCalories,
      target_protein_g: result.targetProteinG,
      target_carbs_g: result.targetCarbsG,
      target_fat_g: result.targetFatG,
      goal,
      activity_level: activityLevel,
    });
    navigate('/nutrition');
  }

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    setManualError(null);
    const kcal = Number.parseInt(manualTarget.replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(kcal) || kcal < 1000 || kcal > 5000) {
      setManualError(t('setup.target_error'));
      return;
    }
    setSaving(true);
    try {
      await upsert({ target_calories: kcal });
      navigate('/nutrition');
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      await clearTarget();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t('setup.back')}
        </Link>

        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-heading">{t('setup.heading')}</h1>
          <p
            className="text-sm text-body mt-2 leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: translated HTML with bold tag
            dangerouslySetInnerHTML={{ __html: t('setup.intro') }}
          />
        </header>

        <section className="rounded-2xl bg-surface-card border border-card-border p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-heading">{t('setup.option1_title')}</h2>
          <p className="text-sm text-muted">{t('setup.option1_desc')}</p>
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label htmlFor="manual-target" className="block text-xs font-medium text-body mb-1">
                {t('setup.target_label')}
              </label>
              <input
                id="manual-target"
                type="number"
                inputMode="numeric"
                min="1000"
                max="5000"
                step="10"
                value={manualTarget}
                onChange={(e) => setManualTarget(e.target.value)}
                placeholder="2100"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>
            {manualError && <p className="text-xs text-red-400">{manualError}</p>}
            <button
              type="submit"
              disabled={saving || loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
            >
              {saving ? t('setup.saving') : t('setup.save')}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-surface-card border border-card-border p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-heading">{t('setup.option2_title')}</h2>
          <TdeeCalculatorForm onAccept={handleTdeeAccept} onCancel={() => navigate('/nutrition')} />
        </section>

        {profile?.target_calories != null && (
          <section className="rounded-2xl bg-surface-card border border-divider p-6 space-y-3">
            <h2 className="font-display text-base font-bold text-heading">{t('setup.current_target_title')}</h2>
            <p className="text-sm text-body">
              {t('setup.current_target', { kcal: profile.target_calories })}
              {profile.goal && (
                <span className="text-muted">
                  {' '}
                  ·{' '}
                  {profile.goal === 'loss'
                    ? t('setup.goal_loss')
                    : profile.goal === 'gain'
                      ? t('setup.goal_gain')
                      : t('setup.goal_maintenance')}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              {t('setup.delete_target')}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
