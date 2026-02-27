import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { getExerciseBySlug } from '../data/exercises.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { CATEGORY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../types/exercise.ts';
import { slugify } from '../utils/exerciseLinks.ts';
import { ContentSection } from './ContentSection.tsx';

export function ExercisePage() {
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
    // Small delay so DOM is painted
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(timer);
  }, [hash]);

  if (!exercise) {
    return <Navigate to="/exercices" replace />;
  }

  return (
    <>
      {/* Hero */}
      <div className="relative">
        <div className="h-48 sm:h-56 overflow-hidden">
          <img src={exercise.image} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-surface/20" />
        </div>

        <Link
          to="/exercices"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Retour aux exercices"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-sm leading-tight">{exercise.name}</h1>
              <p className="text-sm text-white/60 mt-1">{CATEGORY_LABELS[exercise.category]}</p>
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
        <ContentSection title="Exécution" icon="🏋️">
          <p className="text-sm text-subtle leading-relaxed">{exercise.execution}</p>
        </ContentSection>

        {/* Respiration */}
        <ContentSection title="Respiration" icon="💨">
          <p className="text-sm text-subtle leading-relaxed">{exercise.breathing}</p>
        </ContentSection>

        {/* Bénéfices */}
        <ContentSection title="Bénéfices" icon="✅">
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
        <ContentSection title="Variantes" icon="🔄">
          <div className="space-y-4">
            {exercise.variants.map((v, i) => (
              <div
                key={i}
                id={slugify(v.name)}
                className="scroll-mt-24 target:ring-2 target:ring-brand/30 target:rounded-lg target:p-2 target:-m-2"
              >
                <h3 className="text-sm font-bold text-strong mb-1">{v.name}</h3>
                <p className="text-sm text-subtle leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </ContentSection>

        {/* Conseils */}
        <ContentSection title="Nos conseils" icon="💬">
          <ul className="space-y-2">
            {exercise.tips.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-emerald-400 shrink-0 mt-0.5">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Erreurs courantes */}
        <ContentSection title="Erreurs courantes" icon="⚠️">
          <ul className="space-y-2">
            {exercise.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-subtle leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        {/* Navigation */}
        <div className="pt-4 border-t border-divider flex items-center justify-between">
          <Link
            to="/exercices"
            className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Nos exercices
          </Link>
          <Link to="/formats" className="text-sm text-link hover:text-link-hover transition-colors">
            Les formats →
          </Link>
        </div>
      </div>
    </>
  );
}

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[level - 1]}`}>
      {DIFFICULTY_LABELS[level - 1]}
    </span>
  );
}
