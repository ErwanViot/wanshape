import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { EXERCISES_DATA } from '../data/exercises.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import type { ExerciseCategory, ExerciseData } from '../types/exercise.ts';
import { CATEGORY_ORDER, DIFFICULTY_COLORS } from '../types/exercise.ts';

function groupByCategory(exercises: ExerciseData[]): [ExerciseCategory, ExerciseData[]][] {
  const groups = new Map<ExerciseCategory, ExerciseData[]>();
  for (const ex of exercises) {
    const list = groups.get(ex.category) ?? [];
    list.push(ex);
    groups.set(ex.category, list);
  }
  return CATEGORY_ORDER.filter((cat) => groups.has(cat)).map((cat) => [cat, groups.get(cat)!]);
}

export function Exercises() {
  const { t } = useTranslation('explore');
  useDocumentHead({
    title: t('exercises.page_title'),
    description: t('exercises.page_description'),
  });

  const grouped = groupByCategory(EXERCISES_DATA);

  return (
    <>
      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-1 -ml-1 text-muted hover:text-strong transition-colors"
            aria-label={t('exercises.back_aria')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg text-heading">{t('exercises.heading')}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        <p className="text-sm text-subtle leading-relaxed">{t('exercises.intro')}</p>

        {grouped.map(([category, exercises]) => (
          <section key={category}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">{t(`category.${category}`)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exercises.map((ex) => (
                <Link
                  key={ex.slug}
                  to={`/exercices/${ex.slug}`}
                  className="format-card rounded-2xl overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
                >
                  {/* Image */}
                  <div className="relative h-28 overflow-hidden">
                    <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <h3 className="font-bold text-white text-base drop-shadow-sm">{ex.name}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${DIFFICULTY_COLORS[ex.difficulty - 1]}`}
                      >
                        {t(`difficulty_level.${ex.difficulty}`)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {ex.muscles.slice(0, 3).map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-link border border-brand/20"
                        >
                          {m}
                        </span>
                      ))}
                      {ex.muscles.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-muted">
                          +{ex.muscles.length - 3}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-subtle leading-relaxed flex-1 line-clamp-2">{ex.shortDescription}</p>
                    <span className="text-xs text-link font-medium">
                      {t('exercises.variant', { n: ex.variants.length, count: ex.variants.length })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-faint text-center leading-relaxed">{t('exercises.footer_note')}</p>
      </div>
    </>
  );
}
