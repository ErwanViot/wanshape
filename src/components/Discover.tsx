import { Link } from 'react-router';
import { EXERCISES_DATA } from '../data/exercises.ts';
import { FORMATS_DATA } from '../data/formats.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import type { ExerciseCategory, ExerciseData } from '../types/exercise.ts';
import { CATEGORY_LABELS, CATEGORY_ORDER, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../types/exercise.ts';

const FORMAT_SHORT_DESCS: Record<string, string> = {
  pyramid: 'Séries croissantes puis décroissantes',
  classic: 'Travail ciblé en séries classiques',
  superset: 'Deux exercices enchaînés sans pause',
  emom: 'Chaque minute, un effort à compléter',
  circuit: "Rotation d'ateliers variés en boucle",
  amrap: 'Maximum de tours dans le temps imparti',
  hiit: 'Efforts explosifs, récupération courte',
  tabata: '20s à fond, 10s de repos, sans répit',
};

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
  useDocumentHead({
    title: 'Découvrir — WAN SHAPE',
    description: "Explorez nos 8 formats d'entraînement et notre bibliothèque d'exercices.",
  });

  const groupedExercises = groupByCategory(EXERCISES_DATA);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-heading mb-1">Découvrir</h1>
        <p className="text-sm text-muted">Formats d'entraînement et exercices</p>
      </div>

      {/* Formats section — card grid like /formats page */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">Nos formats</h2>
          <Link to="/formats" className="text-xs text-link hover:text-link-hover transition-colors">
            En savoir plus
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
                <h3 className="text-sm font-bold text-heading">{f.name}</h3>
                <span className="text-xs text-muted shrink-0">{f.duration} min</span>
              </div>
              <p className="text-xs text-muted leading-relaxed flex-1">
                {FORMAT_SHORT_DESCS[f.type] ?? f.shortDescription}
              </p>
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
          <h2 className="text-lg font-bold text-heading">Exercices</h2>
          <Link to="/exercices" className="text-xs text-link hover:text-link-hover transition-colors">
            Tout voir
          </Link>
        </div>
        {groupedExercises.map(([category, exercises]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-subtle">{CATEGORY_LABELS[category]}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exercises.slice(0, 6).map((ex) => (
                <Link
                  key={ex.slug}
                  to={`/exercices/${ex.slug}`}
                  className="glass-card rounded-xl overflow-hidden group"
                >
                  <div className="relative h-24">
                    <img src={ex.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-heading truncate">{ex.name}</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${DIFFICULTY_COLORS[ex.difficulty - 1]}`}
                    >
                      {DIFFICULTY_LABELS[ex.difficulty - 1]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {exercises.length > 6 && (
              <Link to="/exercices" className="text-xs text-link hover:text-link-hover transition-colors">
                +{exercises.length - 6} exercices
              </Link>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
