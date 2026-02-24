import { Link } from 'react-router';
import { FORMATS_DATA } from '../data/formats.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';

const FORMAT_DESCRIPTIONS: Record<string, { description: string; benefit: string }> = {
  pyramid: {
    description:
      "Les répétitions augmentent à chaque palier (2, 4, 6, 8…) puis redescendent. L'intensité monte puis diminue naturellement.",
    benefit: "Auto-régulé : l'échauffement est intégré dans la montée.",
  },
  classic: {
    description:
      'Des exercices ciblés en séries avec des temps de repos. Haut du corps (push & pull) ou bas du corps & core.',
    benefit: 'Tonification ciblée. Progression claire et mesurable.',
  },
  superset: {
    description:
      'Deux exercices complémentaires enchaînés sans repos (ex : pompes puis tirage). Repos entre les paires.',
    benefit: 'Travail équilibré et efficace en moins de temps.',
  },
  emom: {
    description: 'À chaque début de minute, réaliser un nombre défini de répétitions. Le temps restant = repos.',
    benefit: "Développe l'endurance et apprend à gérer son effort.",
  },
  circuit: {
    description: "Enchaînement d'exercices variés avec très peu de repos. On répète le circuit plusieurs fois.",
    benefit: 'Combine renforcement et cardio pour un travail complet.',
  },
  amrap: {
    description: 'Enchaîner un circuit le plus de fois possible dans un temps imparti. Vous gérez votre rythme.',
    benefit: 'Liberté de rythme. Idéal pour mesurer sa progression.',
  },
  hiit: {
    description: "Alternance d'effort intense (30s) et de repos (30s). Chaque exercice est réalisé à fond.",
    benefit: 'Maximum de résultats en minimum de temps.',
  },
  tabata: {
    description: "8 rounds de 20 secondes d'effort maximal suivies de 10 secondes de repos. Court mais intense.",
    benefit: 'Le format le plus court et le plus intense.',
  },
};

export function Formats() {
  useDocumentHead({
    title: 'Formats de séance',
    description:
      "8 formats d'entraînement sans matériel : Pyramide, Renforcement, Superset, EMOM, Circuit, AMRAP, HIIT et Tabata. Découvrez chaque méthode.",
  });

  return (
    <>
      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-1 -ml-1 text-muted hover:text-strong transition-colors"
            aria-label="Retour à l'accueil"
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
          <h1 className="font-bold text-lg text-heading">Les formats de séance</h1>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-subtle leading-relaxed">
          <strong className="text-strong">8 formats</strong> alternent au fil des jours : les séances intenses sont plus
          courtes, les séances de renforcement et d'endurance plus longues. Toutes incluent échauffement et étirements.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORMATS_DATA.map((format) => {
            const extra = FORMAT_DESCRIPTIONS[format.type];
            return (
              <Link
                key={format.type}
                to={`/formats/${format.slug}`}
                className="format-card rounded-[20px] overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
              >
                {/* Image — text stays white (over image) */}
                <div className="relative h-28 overflow-hidden">
                  <img src={format.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h2 className="font-bold text-white text-base drop-shadow-sm">{format.name}</h2>
                      <p className="text-[11px] text-white/60">{format.subtitle}</p>
                    </div>
                    <span className="text-xs font-bold text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full shrink-0">
                      {format.duration} min
                    </span>
                  </div>
                </div>

                {/* Content (below image) */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  {/* Intensity dots */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`intensity-dot ${i <= format.intensity ? 'active' : 'inactive'}`} />
                    ))}
                  </div>

                  <p className="text-[13px] text-subtle leading-relaxed flex-1">
                    {extra?.description ?? format.shortDescription}
                  </p>

                  <p className="text-xs text-link font-medium leading-relaxed">{extra?.benefit}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-xs text-faint text-center leading-relaxed">
          Les durées indiquées incluent l'échauffement et les étirements.
        </p>
      </main>
    </>
  );
}
