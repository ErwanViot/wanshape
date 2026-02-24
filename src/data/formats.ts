import type { FormatData } from '../types/format.ts';

export const FORMATS_DATA: FormatData[] = [
  {
    type: 'pyramid',
    slug: 'pyramide',
    name: 'Pyramide',
    subtitle: 'Montée-descente progressive',
    duration: '30-38',
    intensity: 1,
    image: '/images/explosive.webp',
    shortDescription: 'Séries croissantes puis décroissantes pour une montée en charge progressive.',
    principle:
      "Le format Pyramide structure la séance autour d'une montée progressive en répétitions (2, 4, 6, 8…) suivie d'une redescente symétrique. L'intensité augmente naturellement avec le nombre de répétitions, puis diminue, ce qui permet au corps de monter en température graduellement sans choc initial.",
    protocol:
      'Chaque exercice est répété selon un schéma pyramidal. Par exemple : 2 reps → 4 reps → 6 reps → 8 reps → 6 reps → 4 reps → 2 reps. Le repos entre chaque palier est court (15-30s). Le temps de travail par exercice est fixe, le nombre de répétitions monte et descend.',
    benefits: [
      'Échauffement naturellement intégré grâce à la montée progressive',
      "Auto-régulation : le corps s'adapte à chaque palier",
      'Travail en endurance musculaire sur les paliers hauts',
      'Retour au calme facilité par la descente',
      'Format accessible à tous les niveaux de pratique',
    ],
    targetAudience:
      "Idéal pour les débutants et ceux qui reprennent le sport. La montée progressive réduit le risque de blessure et permet de trouver son rythme. Convient aussi aux pratiquants intermédiaires qui veulent travailler l'endurance musculaire.",
    tips: [
      'Concentrez-vous sur la qualité du mouvement plutôt que la vitesse, surtout dans les paliers hauts',
      'Utilisez les paliers bas pour bien placer votre respiration',
      'Si un palier est trop difficile, restez au palier précédent plutôt que de bâcler les répétitions',
      "La descente n'est pas un moment de relâchement : maintenez la technique",
    ],
    commonMistakes: [
      "Aller trop vite sur les premiers paliers et s'épuiser avant le sommet",
      'Négliger la technique quand le nombre de répétitions augmente',
      'Sauter des paliers pour aller plus vite',
      'Ne pas respecter les temps de repos entre les paliers',
    ],
  },
  {
    type: 'classic',
    slug: 'renforcement',
    name: 'Renforcement',
    subtitle: 'Classique par séries',
    duration: '30-35',
    intensity: 2,
    image: '/images/upper.webp',
    shortDescription: 'Travail ciblé en séries classiques avec temps de repos structurés.',
    principle:
      "Le renforcement musculaire classique est le format le plus traditionnel de l'entraînement au poids du corps. Chaque exercice est réalisé en séries successives avec un nombre de répétitions défini et un temps de repos entre les séries. Ce format permet de cibler précisément un groupe musculaire et de lui appliquer un volume de travail suffisant pour progresser.",
    protocol:
      'Les exercices sont organisés par groupes musculaires (haut du corps, bas du corps, core). Chaque exercice est réalisé en 3-4 séries de 8-15 répétitions, avec 30-60 secondes de repos entre les séries. Les séances alternent entre des jours « push » (pompes, dips, épaules) et « pull/legs » (squats, fentes, pont fessier).',
    benefits: [
      'Développement ciblé de la force et de la masse musculaire',
      "Progression mesurable : on peut suivre l'évolution du nombre de reps",
      'Structure simple et familière, facile à suivre',
      'Temps de repos suffisants pour maintenir la qualité du mouvement',
      'Adaptable à tous les niveaux en ajustant reps et séries',
    ],
    targetAudience:
      'Convient à tous les niveaux. Les débutants apprécieront la structure claire et les temps de repos. Les pratiquants avancés peuvent augmenter le nombre de répétitions ou passer à des variantes plus difficiles (pompes déclinées, pistol squats, etc.).',
    tips: [
      "Privilégiez l'amplitude complète du mouvement à la vitesse",
      'Utilisez les temps de repos pour vous hydrater et respirer profondément',
      'Si vous ne pouvez plus maintenir la technique, réduisez les reps plutôt que de tricher',
      "Alternez haut du corps et bas du corps d'un jour à l'autre pour la récupération",
    ],
    commonMistakes: [
      "Raccourcir l'amplitude pour faire plus de répétitions",
      'Ne pas respecter les temps de repos (trop courts ou trop longs)',
      'Toujours travailler les mêmes groupes musculaires au détriment des autres',
      "Bloquer sa respiration pendant l'effort",
    ],
  },
  {
    type: 'superset',
    slug: 'superset',
    name: 'Superset',
    subtitle: 'Paires antagonistes',
    duration: '30-35',
    intensity: 2,
    image: '/images/fullbody.webp',
    shortDescription: 'Deux exercices complémentaires enchaînés sans repos pour un travail équilibré.',
    principle:
      "Le superset consiste à enchaîner deux exercices complémentaires (généralement des muscles antagonistes) sans temps de repos entre eux. Pendant que le premier muscle travaille, l'autre récupère, ce qui permet de doubler le volume de travail dans le même temps. Par exemple : pompes (pectoraux) suivies immédiatement de tirage (dos).",
    protocol:
      "Les exercices sont organisés en paires complémentaires. Chaque paire est réalisée en 3-4 séries. Au sein d'une paire, les deux exercices s'enchaînent sans pause. Le repos (30-60s) intervient entre les paires, pas entre les exercices. Ce rythme maintient un effort constant tout en permettant la récupération musculaire.",
    benefits: [
      'Efficacité temporelle : deux fois plus de travail dans le même temps',
      'Équilibre musculaire grâce au travail des antagonistes',
      "Maintien d'une fréquence cardiaque élevée pour un effet cardio",
      "Récupération active : un muscle récupère pendant que l'autre travaille",
      'Réduction du temps total de la séance sans perte de qualité',
    ],
    targetAudience:
      "Pour les pratiquants qui ont déjà une bonne base technique et qui souhaitent optimiser leur temps d'entraînement. La demande cardiovasculaire est modérée mais supérieure au renforcement classique, ce qui en fait un bon format de transition.",
    tips: [
      'Choisissez des paires qui travaillent des groupes musculaires opposés (push/pull, flexion/extension)',
      "Passez rapidement d'un exercice à l'autre pour maintenir l'effet superset",
      'Si la fatigue compromet votre technique, prenez quelques secondes de transition',
      'Hydratez-vous pendant les repos entre les paires',
    ],
    commonMistakes: [
      "Prendre trop de repos entre les deux exercices d'une paire, ce qui annule l'effet superset",
      'Choisir deux exercices qui sollicitent le même groupe musculaire',
      'Négliger la technique sur le deuxième exercice par fatigue',
      'Ne pas adapter le nombre de répétitions entre les exercices de la paire',
    ],
  },
  {
    type: 'emom',
    slug: 'emom',
    name: 'EMOM',
    subtitle: 'Every Minute On the Minute',
    duration: '28-32',
    intensity: 2,
    image: '/images/endurance.webp',
    shortDescription: "Chaque minute, un effort à compléter. Le temps restant, c'est votre repos.",
    principle:
      "L'EMOM (Every Minute On the Minute) impose un nombre défini de répétitions à réaliser au début de chaque minute. Une fois les répétitions terminées, le temps restant avant la minute suivante est votre repos. Plus vous êtes rapide et efficace, plus vous récupérez. Ce format enseigne la gestion de l'effort : aller trop vite fatigue, aller trop lentement supprime le repos.",
    protocol:
      "Le minuteur tourne par intervalles d'une minute. Au top de chaque minute, réalisez le nombre de répétitions prescrit (ex : 10 squats + 5 pompes). Le temps restant est votre repos. Au top suivant, on repart. La séance dure entre 10 et 16 minutes pour le bloc EMOM, avec échauffement et retour au calme en plus.",
    benefits: [
      "Développe l'endurance musculaire et cardiovasculaire",
      "Enseigne la gestion de l'effort et du rythme",
      "Auto-régulation naturelle : le repos s'adapte à votre vitesse",
      'Motivation par le défi de terminer avant la fin de la minute',
      'Structure claire et prévisible qui facilite le focus mental',
    ],
    targetAudience:
      'Accessible aux débutants si le nombre de répétitions est bien calibré (viser 30-40s de travail par minute pour garder 20-30s de repos). Les pratiquants avancés peuvent augmenter le volume ou la difficulté des mouvements.',
    tips: [
      "Visez un rythme régulier plutôt que d'aller à fond la première minute",
      'Si vous finissez avec moins de 10 secondes de repos, réduisez les reps',
      'Utilisez le repos pour respirer profondément et vous recentrer',
      'Gardez un œil sur le chrono pour anticiper le départ de la minute suivante',
    ],
    commonMistakes: [
      'Partir trop vite les premières minutes et ne plus avoir de repos ensuite',
      'Bâcler les dernières répétitions pour grappiller du repos',
      'Ne pas adapter le volume quand on sent que le repos disparaît',
      'Oublier de compter ses répétitions dans la précipitation',
    ],
  },
  {
    type: 'circuit',
    slug: 'circuit',
    name: 'Circuit',
    subtitle: 'Enchaînement full body',
    duration: '30-38',
    intensity: 3,
    image: '/images/fullbody.webp',
    shortDescription: "Rotation d'exercices variés en boucle, mêlant renforcement et cardio.",
    principle:
      "Le circuit training enchaîne plusieurs exercices différents avec un repos minimal entre chacun. Chaque exercice cible un groupe musculaire ou une capacité physique différente, ce qui permet de maintenir l'effort global tout en laissant chaque muscle récupérer partiellement. Le circuit est répété plusieurs fois (rounds) pour augmenter le volume total.",
    protocol:
      'Un circuit typique comprend 4 à 6 exercices variés (haut du corps, bas du corps, core, cardio). Chaque exercice est réalisé pendant 30-45 secondes ou un nombre fixe de répétitions. Le repos entre les exercices est court (10-15s de transition). Le repos entre les rounds est de 60-90 secondes. La séance comprend généralement 3 à 5 rounds.',
    benefits: [
      'Travail complet du corps en une seule séance',
      'Combinaison efficace de renforcement musculaire et de cardio',
      "Variété d'exercices qui maintient la motivation et l'engagement",
      'Adaptable en intensité : on peut jouer sur le nombre de rounds et le temps de repos',
      "Brûle beaucoup de calories grâce au maintien d'une fréquence cardiaque élevée",
    ],
    targetAudience:
      "Format polyvalent qui convient aux pratiquants de niveau intermédiaire. Les débutants peuvent l'aborder en allongeant les temps de repos. C'est le format idéal quand on veut un entraînement complet sans se spécialiser.",
    tips: [
      "Alternez les groupes musculaires dans l'ordre du circuit pour éviter la fatigue locale",
      "Gardez un rythme constant plutôt que d'alterner sprints et pauses longues",
      'Le premier round est un échauffement : montez progressivement en intensité',
      'Si un exercice est trop difficile, passez à sa variante simplifiée plutôt que de sauter',
    ],
    commonMistakes: [
      'Mettre deux exercices sollicitant le même muscle à la suite',
      "Sprinter sur les premiers rounds et s'effondrer sur les derniers",
      'Couper les temps de repos au point de compromettre la technique',
      'Négliger les exercices de core ou de mobilité dans le circuit',
    ],
  },
  {
    type: 'amrap',
    slug: 'amrap',
    name: 'AMRAP',
    subtitle: 'As Many Rounds As Possible',
    duration: '28-32',
    intensity: 3,
    image: '/images/endurance.webp',
    shortDescription: 'Maximum de tours dans le temps imparti. Vous gérez votre propre rythme.',
    principle:
      "L'AMRAP (As Many Rounds As Possible) donne un circuit court d'exercices et un temps total à remplir. L'objectif : réaliser le plus de tours complets possible avant la fin du chrono. Chacun avance à son rythme — il n'y a pas de « bon » nombre de tours, seulement votre record personnel à battre la prochaine fois.",
    protocol:
      'Un circuit de 3-5 exercices avec un nombre de répétitions fixe par exercice (ex : 10 squats, 8 pompes, 6 burpees). Le chrono tourne en continu pendant 8-15 minutes. Pas de repos imposé : vous gérez vos pauses. À la fin, comptez le nombre total de rounds complétés et les répétitions du round en cours.',
    benefits: [
      'Mesure objective de la progression : le nombre de rounds est un indicateur clair',
      "Liberté totale de rythme : chacun s'adapte à son niveau",
      'Motivation par le défi personnel de battre son score',
      "Développe la capacité à gérer l'effort sur la durée",
      'Format simple à comprendre et à suivre',
    ],
    targetAudience:
      "Excellent format pour tous les niveaux. Le débutant fera 3 rounds là où l'avancé en fera 7, mais les deux auront un entraînement adapté. Le côté « score » est très motivant pour les compétiteurs dans l'âme.",
    tips: [
      'Trouvez un rythme soutenable dès le premier round et maintenez-le',
      "Il vaut mieux un rythme constant qu'un départ rapide suivi d'une chute",
      'Notez votre score pour le comparer la prochaine fois',
      'Respirez entre les exercices plutôt que de vous arrêter complètement',
    ],
    commonMistakes: [
      'Partir comme un sprint sur le premier round et cramer en 3 minutes',
      'Sacrifier la technique pour grappiller des reps',
      'Prendre de longues pauses entre les exercices au lieu de ralentir le rythme global',
      'Ne pas noter son score, ce qui empêche de mesurer la progression',
    ],
  },
  {
    type: 'hiit',
    slug: 'hiit',
    name: 'HIIT',
    subtitle: 'High-Intensity Interval Training',
    duration: '25-30',
    intensity: 4,
    image: '/images/cardio.webp',
    shortDescription: 'Efforts explosifs suivis de récupération courte. Court, intense, efficace.',
    principle:
      "Le HIIT alterne des phases d'effort maximal avec des phases de repos ou de récupération active. L'objectif est de pousser le corps dans sa zone d'effort intense pendant les phases de travail, puis de récupérer juste assez pour repartir. Ce format exploite l'effet « afterburn » (EPOC) : le corps continue de brûler des calories plusieurs heures après l'entraînement.",
    protocol:
      "Les intervalles typiques sont de 30 secondes d'effort suivi de 30 secondes de repos (ratio 1:1). Chaque round comprend un exercice réalisé à intensité maximale. La séance comprend 8-12 rounds, soit 8-12 minutes de HIIT pur, encadrées par un échauffement et un retour au calme.",
    benefits: [
      'Efficacité maximale : des résultats significatifs en peu de temps',
      'Effet afterburn : le métabolisme reste élevé pendant des heures après la séance',
      'Amélioration rapide de la capacité cardiovasculaire',
      'Pas de matériel nécessaire : les exercices au poids du corps suffisent',
      "Format court qui s'intègre facilement dans un emploi du temps chargé",
    ],
    targetAudience:
      "Réservé aux pratiquants qui ont déjà une bonne condition physique de base et qui maîtrisent la technique des mouvements fondamentaux. L'intensité élevée demande un système cardiovasculaire en bon état et une conscience corporelle développée pour ne pas se blesser.",
    tips: [
      "Donnez vraiment tout pendant les phases de travail — c'est court, profitez-en",
      'Utilisez les phases de repos pour respirer activement, pas pour consulter votre téléphone',
      'Choisissez des exercices que vous maîtrisez bien, car la fatigue va dégrader votre technique',
      'Ne faites pas de HIIT deux jours consécutifs : votre corps a besoin de récupérer',
    ],
    commonMistakes: [
      "Ne pas donner assez d'intensité pendant les phases de travail (le « I » de HIIT veut dire Intense)",
      'Enchaîner les séances HIIT sans jours de repos entre elles',
      'Choisir des mouvements trop complexes qui deviennent dangereux sous fatigue',
      "Ignorer l'échauffement sous prétexte que la séance est courte",
    ],
  },
  {
    type: 'tabata',
    slug: 'tabata',
    name: 'Tabata',
    subtitle: 'Protocole 20/10',
    duration: '25-28',
    intensity: 5,
    image: '/images/cardio.webp',
    shortDescription: '20 secondes à fond, 10 secondes de repos. Le format le plus court et le plus intense.',
    principle:
      "Le protocole Tabata, développé par le Dr Izumi Tabata en 1996, est un format d'entraînement par intervalles ultra-courts. Le ratio travail/repos de 2:1 (20s d'effort / 10s de repos) est conçu pour pousser le corps à son maximum absolu. En seulement 4 minutes par set (8 rounds de 30 secondes), ce protocole développe simultanément les filières aérobie et anaérobie.",
    protocol:
      "Un set Tabata classique : 8 rounds de 20 secondes d'effort maximal suivies de 10 secondes de repos. Total : 4 minutes. Sur WAN SHAPE, les séances Tabata incluent 1 à 2 sets avec un repos de 60 secondes entre les sets. L'effort pendant les 20 secondes doit être maximal : si vous pouvez parler, vous n'allez pas assez fort.",
    benefits: [
      'Format le plus court : 4 minutes de travail intense par set',
      'Amélioration prouvée scientifiquement des capacités aérobie et anaérobie',
      'Effet afterburn significatif malgré la durée courte',
      "Développe la puissance, l'explosivité et l'endurance simultanément",
      "Défi mental : apprendre à maintenir l'intensité quand le corps dit stop",
    ],
    targetAudience:
      "Réservé aux pratiquants avancés avec une excellente condition cardiovasculaire. Ce n'est pas un format pour débuter le sport. Il demande une maîtrise parfaite des mouvements car les 20 secondes d'effort maximal sous fatigue exigent un contrôle technique irréprochable.",
    tips: [
      'Choisissez des mouvements simples et explosifs (burpees, mountain climbers, squats sautés)',
      'Les 10 secondes de repos passent très vite : positionnez-vous immédiatement pour le round suivant',
      "L'effort doit être véritablement maximal : à la fin des 8 rounds, vous devez être épuisé",
      'Limitez-vous à 1-2 séances Tabata par semaine maximum',
    ],
    commonMistakes: [
      "Garder du rythme en réserve « au cas où » — le Tabata exige 100% d'effort à chaque round",
      'Utiliser des mouvements complexes qui deviennent dangereux sous fatigue extrême',
      'Faire des séances Tabata trop fréquemment (plus de 2 fois par semaine)',
      'Confondre Tabata avec du HIIT classique : 20/10 est beaucoup plus intense que 30/30',
    ],
  },
];

export function getFormatBySlug(slug: string): FormatData | undefined {
  return FORMATS_DATA.find((f) => f.slug === slug);
}
