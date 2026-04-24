import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { EXERCISES_DATA } from '../data/exercises.ts';
import { FORMATS_DATA } from '../data/formats.ts';
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

export function Discover() {
  const { t } = useTranslation('explore');
  const { t: td } = useTranslation('formats_data');
  const { t: te } = useTranslation('exercises_data');
  useDocumentHead({
    title: t('discover.page_title'),
    description: t('discover.page_description'),
  });

  const groupedExercises = groupByCategory(EXERCISES_DATA);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 lg:px-14 py-6 md:py-8 space-y-10">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-black text-heading">{t('discover.heading')}</h1>
        <p className="text-sm text-muted mt-1">{t('discover.subtitle')}</p>
      </div>

      {/* Formats section — card grid like /formats page */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">{t('discover.formats_section')}</h2>
          <Link to="/formats" className="text-xs text-link hover:text-link-hover transition-colors">
            {t('discover.formats_more')}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FORMATS_DATA.map((f) => (
            <Link
              key={f.type}
              to={`/formats/${f.slug}`}
              className="glass-card rounded-xl p-4 flex flex-col gap-3 hover:border-divider-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-heading">{td(`${f.slug}.name`)}</h3>
                <span className="text-xs text-muted shrink-0">{f.duration} min</span>
              </div>
              <p className="text-xs text-muted leading-relaxed flex-1">{td(`${f.slug}.shortDescription`)}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`intensity-dot ${i <= f.intensity ? 'active' : 'inactive'}`} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Exercises section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">{t('discover.exercises_section')}</h2>
          <Link to="/exercices" className="text-xs text-link hover:text-link-hover transition-colors">
            {t('discover.exercises_more')}
          </Link>
        </div>
        {groupedExercises.map(([category, exercises]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-subtle">{t(`category.${category}`)}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exercises.slice(0, 6).map((ex) => {
                const exName = te(`${ex.slug}.name`);
                return (
                  <Link
                    key={ex.slug}
                    to={`/exercices/${ex.slug}`}
                    className="glass-card rounded-xl overflow-hidden group"
                  >
                    <div className="relative h-24">
                      <img src={ex.image} alt={exName} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-heading truncate">{exName}</span>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${DIFFICULTY_COLORS[ex.difficulty - 1]}`}
                      >
                        {t(`difficulty_level.${ex.difficulty}`)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {exercises.length > 6 && (
              <Link to="/exercices" className="text-xs text-link hover:text-link-hover transition-colors">
                {t('discover.more_exercises', { n: exercises.length - 6 })}
              </Link>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
