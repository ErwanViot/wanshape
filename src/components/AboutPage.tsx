import { useDocumentHead } from '../hooks/useDocumentHead.ts';

export function AboutPage() {
  useDocumentHead({
    title: 'À propos',
    description:
      'Découvrez l\'histoire de Wan2Fit : un player d\'entraînement né de la frustration de configurer des timers, devenu un outil complet pour s\'entraîner sans friction.',
  });

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-10 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl font-black text-heading mb-8">
        Pourquoi Wan2Fit&nbsp;?
      </h1>

      <div className="space-y-5 text-body leading-relaxed">
        <p>
          Tout a commencé avec un problème bête&nbsp;: je passais plus de temps
          à configurer mes timers qu'à m'entraîner.
        </p>

        <p>
          Temps d'exécution, temps de repos, nombre de séries, ordre des
          exercices… Aucune app ne me laissait simplement lancer une séance et
          suivre le rythme sans me prendre la tête.
        </p>

        <p>
          Alors j'ai construit mon propre player. Un outil qui gère le chrono et
          les enchaînements à ma place. Qui me dit quoi faire et quand. Rien de
          plus.
        </p>

        <p>
          Ce player, c'est le cœur de Wan2Fit. Autour, j'ai ajouté des formats
          variés, des programmes structurés sur plusieurs semaines, et un
          assistant IA capable de créer des séances sur mesure.
        </p>

        <p>
          L'idée reste la même depuis le début&nbsp;: moins de friction, plus
          d'entraînement.
        </p>
      </div>

      {/* Signature */}
      <div className="mt-10 flex items-center gap-4">
        <img
          src="/photo-wan.png"
          alt="Wan, créateur de Wan2Fit"
          className="w-16 h-16 rounded-full object-cover"
        />
        <span className="text-subtle text-lg italic">— Wan</span>
      </div>
    </div>
  );
}
