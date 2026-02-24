import { Link } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { EXERCISES_DATA } from '../data/exercises.ts';
import { CATEGORY_LABELS, CATEGORY_ORDER, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../types/exercise.ts';
import type { ExerciseData, ExerciseCategory } from '../types/exercise.ts';

function groupByCategory(exercises: ExerciseData[]): [ExerciseCategory, ExerciseData[]][] {
  const groups = new Map<ExerciseCategory, ExerciseData[]>();
  for (const ex of exercises) {
    const list = groups.get(ex.category) ?? [];
    list.push(ex);
    groups.set(ex.category, list);
  }
  return CATEGORY_ORDER
    .filter(cat => groups.has(cat))
    .map(cat => [cat, groups.get(cat)!]);
}

export function Exercises() {
  useDocumentHead({
    title: 'Nos exercices',
    description: 'Tous les exercices WAN SHAPE : fiches détaillées avec exécution, variantes, conseils et erreurs courantes.',
  });

  const grouped = groupByCategory(EXERCISES_DATA);

  return (
    <>
      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-1 -ml-1 text-muted hover:text-strong transition-colors"
            aria-label="Retour à l'accueil"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg text-heading">Nos exercices</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        <p className="text-sm text-subtle leading-relaxed">
          Retrouvez ici les fiches détaillées de nos exercices : exécution, respiration, variantes, conseils et erreurs courantes.
        </p>

        {grouped.map(([category, exercises]) => (
          <section key={category}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exercises.map(ex => (
                <Link
                  key={ex.slug}
                  to={`/exercices/${ex.slug}`}
                  className="format-card rounded-[20px] overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
                >
                  {/* Image */}
                  <div className="relative h-28 overflow-hidden">
                    <img src={ex.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <h3 className="font-bold text-white text-base drop-shadow-sm">{ex.name}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${DIFFICULTY_COLORS[ex.difficulty - 1]}`}>
                        {DIFFICULTY_LABELS[ex.difficulty - 1]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {ex.muscles.slice(0, 3).map(m => (
                        <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-link border border-brand/20">
                          {m}
                        </span>
                      ))}
                      {ex.muscles.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-muted">
                          +{ex.muscles.length - 3}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-subtle leading-relaxed flex-1 line-clamp-2">
                      {ex.shortDescription}
                    </p>
                    <span className="text-xs text-link font-medium">
                      {ex.variants.length} variante{ex.variants.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-faint text-center leading-relaxed">
          De nouvelles fiches sont ajoutées régulièrement.
        </p>
      </main>
    </>
  );
}
