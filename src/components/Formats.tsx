import { Link } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';

const FORMATS = [
  {
    type: 'pyramid' as const,
    slug: 'pyramide',
    name: 'Pyramide',
    subtitle: 'Montée-descente progressive',
    duration: '30-38',
    intensity: 1,
    image: '/images/explosive.webp',
    description: 'Les répétitions augmentent à chaque palier (2, 4, 6, 8…) puis redescendent. L\'intensité monte puis diminue naturellement.',
    benefit: 'Auto-régulé : l\'échauffement est intégré dans la montée.',
  },
  {
    type: 'classic' as const,
    slug: 'renforcement',
    name: 'Renforcement',
    subtitle: 'Classique par séries',
    duration: '30-35',
    intensity: 2,
    image: '/images/upper.webp',
    description: 'Des exercices ciblés en séries avec des temps de repos. Haut du corps (push & pull) ou bas du corps & core.',
    benefit: 'Tonification ciblée. Progression claire et mesurable.',
  },
  {
    type: 'superset' as const,
    slug: 'superset',
    name: 'Superset',
    subtitle: 'Paires antagonistes',
    duration: '30-35',
    intensity: 2,
    image: '/images/fullbody.webp',
    description: 'Deux exercices complémentaires enchaînés sans repos (ex : pompes puis tirage). Repos entre les paires.',
    benefit: 'Travail équilibré et efficace en moins de temps.',
  },
  {
    type: 'emom' as const,
    slug: 'emom',
    name: 'EMOM',
    subtitle: 'Every Minute On the Minute',
    duration: '28-32',
    intensity: 2,
    image: '/images/endurance.webp',
    description: 'À chaque début de minute, réaliser un nombre défini de répétitions. Le temps restant = repos.',
    benefit: 'Développe l\'endurance et apprend à gérer son effort.',
  },
  {
    type: 'circuit' as const,
    slug: 'circuit',
    name: 'Circuit',
    subtitle: 'Enchaînement full body',
    duration: '30-38',
    intensity: 3,
    image: '/images/fullbody.webp',
    description: 'Enchaînement d\'exercices variés avec très peu de repos. On répète le circuit plusieurs fois.',
    benefit: 'Combine renforcement et cardio pour un travail complet.',
  },
  {
    type: 'amrap' as const,
    slug: 'amrap',
    name: 'AMRAP',
    subtitle: 'As Many Rounds As Possible',
    duration: '28-32',
    intensity: 3,
    image: '/images/endurance.webp',
    description: 'Enchaîner un circuit le plus de fois possible dans un temps imparti. Vous gérez votre rythme.',
    benefit: 'Liberté de rythme. Idéal pour mesurer sa progression.',
  },
  {
    type: 'hiit' as const,
    slug: 'hiit',
    name: 'HIIT',
    subtitle: 'High-Intensity Interval Training',
    duration: '25-30',
    intensity: 4,
    image: '/images/cardio.webp',
    description: 'Alternance d\'effort intense (30s) et de repos (30s). Chaque exercice est réalisé à fond.',
    benefit: 'Maximum de résultats en minimum de temps.',
  },
  {
    type: 'tabata' as const,
    slug: 'tabata',
    name: 'Tabata',
    subtitle: 'Protocole 20/10',
    duration: '25-28',
    intensity: 5,
    image: '/images/cardio.webp',
    description: '8 rounds de 20 secondes d\'effort maximal suivies de 10 secondes de repos. Court mais intense.',
    benefit: 'Le format le plus court et le plus intense.',
  },
];

export function Formats() {
  useDocumentHead({
    title: 'Formats de séance',
    description: '8 formats d\'entraînement sans matériel : Pyramide, Renforcement, Superset, EMOM, Circuit, AMRAP, HIIT et Tabata. Découvrez chaque méthode.',
  });

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface border-b border-white/8 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-1 -ml-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg text-white">Les formats de séance</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-white/50 leading-relaxed">
          <strong className="text-white/70">8 formats</strong> alternent au fil des jours : les séances intenses sont plus courtes, les séances de renforcement et d'endurance plus longues. Toutes incluent échauffement et étirements.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORMATS.map((format) => (
            <Link
              key={format.type}
              to={`/formats/${format.slug}`}
              className="rounded-[20px] overflow-hidden flex flex-col transition-transform hover:scale-[1.01]"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
            >
              {/* Image */}
              <div className="relative h-28 overflow-hidden">
                <img
                  src={format.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
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

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Intensity dots */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`intensity-dot ${i <= format.intensity ? 'active' : 'inactive'}`} />
                  ))}
                </div>

                <p className="text-[13px] text-white/50 leading-relaxed flex-1">
                  {format.description}
                </p>

                <p className="text-xs text-indigo-400 font-medium leading-relaxed">
                  {format.benefit}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-white/30 text-center leading-relaxed">
          Les durées indiquées incluent l'échauffement et les étirements.
        </p>
      </main>
    </div>
  );
}
