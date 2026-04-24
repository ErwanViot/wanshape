import { AlertTriangle, CheckCircle, ChevronLeft, Dumbbell, GitBranch, Lightbulb, Wind } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { getExerciseBySlug } from '../data/exercises.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { DIFFICULTY_COLORS } from '../types/exercise.ts';
import { slugify } from '../utils/exerciseLinks.ts';
import { ContentSection } from './ContentSection.tsx';

export function ExercisePage() {
  const { t } = useTranslation('explore');
  const { slug } = useParams<{ slug: string }>();
  const { hash } = useLocation();
  const exercise = slug ? getExerciseBySlug(slug) : undefined;

  useDocumentHead({
    title: exercise ? `${exercise.name} — Exercice` : 'Exercice',
    description: exercise
      ? `${exercise.name} : ${exercise.shortDescription} Exécution, variantes, conseils et erreurs courantes.`
      : undefined,
  });

  // Scroll to variant anchor on mount
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [hash]);

  if (!exercise) {
    return <Navigate to="/exercices" replace />;
  }

  return (
    <>
      {/* Hero */}
      <div className="relative">
        <div className="h-48 sm:h-56 overflow-hidden">
          <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-surface/20" />
        </div>

        <Link
          to="/exercices"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label={t('exercise_page.back_aria')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-black text-white drop-shadow-sm leading-tight">
                {exercise.name}
              </h1>
              <p className="text-sm text-white/60 mt-1">{t(`category.${exercise.category}`)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DifficultyBadge level={exercise.difficulty} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <p className="text-base text-body leading-relaxed">{exercise.shortDescription}</p>

        {/* Vidéo */}
        {exercise.video && (
          <video
            src={`${exercise.video}#t=0.1`}
            controls
            muted
            playsInline
            preload="metadata"
            aria-label={t('exercise_page.demo_aria', { name: exercise.name })}
            className="w-full rounded-xl"
          />
        )}

        {/* Muscles ciblés */}
        <div className="flex flex-wrap gap-2">
          {exercise.muscles.map((m) => (
            <span
              key={m}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-brand/10 text-link border border-brand/20"
            >
              {m}
            </span>
          ))}
        </div>

        {/* Exécution */}
        <ContentSection
          title={t('exercise_page.section_execution')}
          icon={<Dumbbell className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <p className="text-sm text-subtle leading-relaxed">{exercise.execution}</p>
        </ContentSection>

        {/* Respiration */}
        <ContentSection
          title={t('exercise_page.section_breathing')}
          icon={<Wind className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <p className="text-sm text-subtle leading-relaxed">{exercise.breathing}</p>
        </ContentSection>

        {/* Bénéfices */}
        <ContentSection
          title={t('exercise_page.section_benefits')}
          icon={<CheckCircle className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <ul className="space-y-2">
            {exercise.benefits.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-link shrink-0 mt-0.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Variantes */}
        <ContentSection
          title={t('exercise_page.section_variants')}
          icon={<GitBranch className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <div className="space-y-4">
            {exercise.variants.map((v, i) => (
              <div
                key={i}
                id={slugify(v.name)}
                className="scroll-mt-24 target:ring-2 target:ring-brand/30 target:rounded-lg target:p-2 target:-m-2"
              >
                <h3 className="text-sm font-bold text-strong mb-1">{v.name}</h3>
                <p className="text-sm text-subtle leading-relaxed">{v.description}</p>
                {v.video && (
                  <video
                    src={`${v.video}#t=0.1`}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    aria-label={t('exercise_page.demo_aria', { name: v.name })}
                    className="w-full rounded-lg mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        </ContentSection>

        {/* Conseils */}
        <ContentSection
          title={t('exercise_page.section_tips')}
          icon={<Lightbulb className="w-4 h-4 text-brand" aria-hidden="true" />}
        >
          <ul className="space-y-2">
            {exercise.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Erreurs courantes */}
        <ContentSection
          title={t('exercise_page.section_mistakes')}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />}
        >
          <ul className="space-y-2">
            {exercise.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Cross-links */}
        <div className="pt-4 border-t border-divider space-y-3">
          <div className="flex flex-wrap gap-3">
            <Link to="/formats" className="text-sm text-link hover:text-link-hover transition-colors">
              {t('exercise_page.link_formats')}
            </Link>
            <Link to="/programmes" className="text-sm text-link hover:text-link-hover transition-colors">
              {t('exercise_page.link_programs')}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <Link
              to="/exercices"
              className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('exercise_page.all_exercises')}
            </Link>
            <Link to="/" className="text-sm text-link hover:text-link-hover transition-colors">
              {t('exercise_page.today_session')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const { t } = useTranslation('explore');
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[level - 1]}`}>
      {t(`difficulty_level.${level}`)}
    </span>
  );
}
