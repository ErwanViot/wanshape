import type { ExerciseData } from '../types/exercise.ts';

export const EXERCISES_DATA: ExerciseData[] = [
  // ─── Haut du corps ──────────────────────────────────────────────
  {
    slug: 'pompes-classiques',
    name: 'Pompes classiques',
    aliases: ['Pompes', 'Push-ups', 'Scapular push-ups', 'Pompes pike'],
    category: 'upper',
    muscles: ['Pectoraux', 'Triceps', 'Deltoïdes antérieurs', 'Core (stabilisation)'],
    difficulty: 2,
    image: '/images/upper.webp',
    video: '/videos/pompes-classiques.mp4',
    shortDescription:
      "L'exercice fondamental du haut du corps au poids du corps. Les pompes développent la poussée horizontale en sollicitant pectoraux, triceps et épaules dans un mouvement complet et fonctionnel.",
    execution:
      "Position de départ : mains au sol légèrement plus larges que les épaules, bras tendus, corps aligné de la tête aux talons. Les pieds sont serrés ou légèrement écartés. Descendez en fléchissant les coudes jusqu'à ce que la poitrine frôle le sol (coudes à environ 45° du corps, pas écartés à 90°). Poussez pour revenir à la position initiale en verrouillant les bras. Le corps reste gainé tout au long du mouvement : pas de creux dans le dos, pas de fesses en l'air.",
    breathing:
      "Inspirez pendant la descente, expirez pendant la poussée. Ne bloquez jamais votre respiration, même quand l'effort devient intense.",
    benefits: [
      "Renforce l'ensemble de la chaîne de poussée (pectoraux, triceps, épaules)",
      'Travaille le gainage du tronc en position de planche dynamique',
      'Ne nécessite aucun matériel et se pratique partout',
      'Transfert direct vers les mouvements du quotidien (se relever, pousser une porte)',
      'Des dizaines de variantes permettent de progresser indéfiniment',
    ],
    variants: [
      {
        name: 'Pompes inclinées',
        description:
          "Mains sur un support surélevé (chaise, marche). Réduit la charge et facilite le mouvement — idéal pour débuter ou en fin de série quand la fatigue s'installe.",
        video: '/videos/pompes-inclinees.mp4',
      },
      {
        name: 'Pompes diamant',
        description:
          'Mains rapprochées sous la poitrine, pouces et index formant un losange. Augmente le travail des triceps et de la partie interne des pectoraux.',
      },
      {
        name: 'Pompes déclinées',
        description:
          'Pieds surélevés sur un support. Augmente la charge sur les épaules et la partie haute des pectoraux. Réservé aux pratiquants qui maîtrisent les pompes classiques.',
      },
      {
        name: 'Pompes explosives',
        description:
          'Poussée suffisamment puissante pour que les mains décollent du sol. Développe la puissance et la vitesse de contraction musculaire.',
      },
      {
        name: 'Pompes archer',
        description:
          "Un bras tendu sur le côté, l'autre bras effectue l'essentiel de la poussée. Développe la force unilatérale et prépare progressivement aux pompes à un bras.",
      },
      {
        name: 'Pompes commando',
        description:
          "Départ en planche sur les avant-bras, montée en planche bras tendus un bras après l'autre, puis redescente. Travaille la force de transition et la stabilité du tronc sous effort asymétrique.",
      },
      {
        name: 'Pompes Hindu',
        description:
          "Départ en position du chien tête en bas, le corps plonge vers l'avant en rasant le sol puis remonte en cobra. Mouvement dynamique qui combine souplesse, force et mobilité de la colonne.",
      },
      {
        name: 'Pompes larges',
        description:
          "Mains placées nettement plus larges que les épaules. Augmente le recrutement des pectoraux et réduit l'implication des triceps — idéal pour cibler la poitrine au poids du corps.",
      },
      {
        name: 'Pike push-ups',
        description:
          'Hanches hautes en V inversé, poussée verticale vers le sol. Cible les épaules de manière similaire à un développé militaire — excellente progression vers le handstand push-up.',
      },
      {
        name: 'Pompes scapulaires',
        description:
          'En position de planche bras tendus, seules les omoplates bougent (protraction et rétraction) sans fléchir les coudes. Renforce le dentelé antérieur et améliore la stabilité scapulaire.',
      },
    ],
    tips: [
      'Gardez les coudes à 45° du corps (ni collés, ni écartés à 90°) pour protéger les épaules',
      'Serrez les abdos et les fessiers comme si vous teniez une planche — le corps ne doit pas "casser"',
      "Descendez jusqu'en bas : les demi-pompes ne comptent pas et limitent la progression",
      "Si vous n'arrivez pas à faire une pompe complète, commencez par les pompes inclinées plutôt que sur les genoux",
    ],
    commonMistakes: [
      "Le bassin qui s'affaisse (dos creux) — signe d'un gainage insuffisant. Contractez les abdos.",
      'Les fesses qui montent en pic — raccourcit le mouvement et supprime le travail des pectoraux',
      "Les coudes qui s'écartent à 90° — crée un stress excessif sur l'articulation de l'épaule",
      "L'amplitude incomplète — ne pas descendre assez bas limite les gains de force et de mobilité",
      'La tête qui tombe vers le sol — gardez le regard vers le sol, à 30 cm devant vos mains, nuque neutre',
    ],
  },
  {
    slug: 'dips-sur-chaise',
    name: 'Dips sur chaise',
    aliases: ['Dips', 'Triceps dips'],
    category: 'upper',
    muscles: ['Triceps', 'Deltoïdes antérieurs', 'Pectoraux (partie basse)'],
    difficulty: 2,
    image: '/images/upper.webp',
    shortDescription:
      "Un exercice de poussée verticale qui cible les triceps en utilisant une chaise ou un support stable. Les dips sur chaise sont l'un des meilleurs mouvements au poids du corps pour sculpter l'arrière des bras et renforcer la poussée.",
    execution:
      "Asseyez-vous au bord d'une chaise ou d'un banc stable, mains agrippées au rebord de chaque côté des hanches, doigts vers l'avant. Avancez les pieds pour décoller les fesses du support, bras tendus. Descendez en fléchissant les coudes vers l'arrière (pas vers l'extérieur) jusqu'à ce que vos bras forment un angle d'environ 90°. Poussez dans vos paumes pour remonter en verrouillant les bras en haut. Gardez le dos proche du support tout au long du mouvement — ne vous éloignez pas de la chaise. Les épaules restent basses et en arrière, loin des oreilles.",
    breathing:
      'Inspirez pendant la descente en contrôlant le mouvement. Expirez en poussant pour remonter. Ne bloquez pas votre respiration en position basse.',
    benefits: [
      'Isole efficacement les triceps avec un mouvement naturel de poussée',
      'Renforce les deltoïdes antérieurs et la partie basse des pectoraux',
      "Ne nécessite qu'une chaise, un banc ou une marche — praticable partout",
      'Développe la force de poussée verticale utile au quotidien',
      'Intensité facilement modulable en ajustant la position des pieds',
    ],
    variants: [],
    tips: [
      'Utilisez un support parfaitement stable — une chaise qui glisse peut provoquer une chute',
      "Gardez les coudes serrés et dirigés vers l'arrière, jamais vers l'extérieur",
      'Pour faciliter le mouvement, rapprochez les pieds du support en fléchissant les genoux',
      'Pour augmenter la difficulté, tendez les jambes ou surélevez les pieds sur un second support',
    ],
    commonMistakes: [
      "Les coudes qui s'écartent vers l'extérieur — gardez-les serrés et dirigés vers l'arrière pour protéger les épaules",
      "Descendre trop bas (au-delà de 90°) — crée un stress excessif sur l'articulation de l'épaule",
      "Les épaules qui montent vers les oreilles — tirez les omoplates vers le bas et l'arrière",
      "Le dos qui s'éloigne de la chaise — restez proche du support pour maintenir le travail sur les triceps",
      'Pousser avec les jambes au lieu des bras — les pieds sont un appui, pas le moteur du mouvement',
    ],
  },
  {
    slug: 'rowing-inverse',
    name: 'Rowing inverse (table)',
    aliases: ['Rowing inverse', 'Inverted row'],
    category: 'upper',
    muscles: ['Dorsaux', 'Rhomboïdes', 'Trapèzes', 'Biceps', 'Deltoïdes postérieurs'],
    difficulty: 2,
    image: '/images/upper.webp',
    shortDescription:
      "Le pendant inversé des pompes pour le haut du dos. Le rowing inverse sous une table ou une barre basse permet de travailler la traction horizontale au poids du corps en ciblant les dorsaux, les rhomboïdes et les biceps. Un exercice fondamental pour l'équilibre postural.",
    execution:
      "Allongez-vous sous une table solide (ou une barre basse) et saisissez le bord de la table avec les mains à largeur d'épaules, paumes vers vous ou en prise neutre. Le corps est aligné de la tête aux talons, bras tendus, talons au sol. En gardant le corps parfaitement gainé, tirez votre poitrine vers la table en serrant les omoplates l'une vers l'autre. Les coudes passent le long du corps (pas écartés). Montez jusqu'à ce que la poitrine touche ou s'approche de la table, marquez un temps d'arrêt en haut en contractant le haut du dos, puis redescendez lentement jusqu'à l'extension complète des bras.",
    breathing:
      "Expirez en tirant la poitrine vers la table, inspirez en redescendant de manière contrôlée. Gardez les abdominaux engagés pour maintenir l'alignement du corps pendant toute la série.",
    benefits: [
      "Renforce l'ensemble de la chaîne de traction : dorsaux, rhomboïdes, trapèzes et biceps",
      'Corrige les déséquilibres posturaux en ciblant les muscles du haut du dos souvent négligés',
      'Prépare aux tractions classiques en développant la force de traction horizontale',
      'Améliore la rétraction scapulaire, essentielle pour la santé des épaules',
      "Ne nécessite qu'une table solide ou une barre basse — réalisable à la maison",
    ],
    variants: [
      {
        name: 'Face pulls au sol',
        description:
          "Allongé sur le ventre, bras tendus devant vous, tirez les coudes vers l'arrière en serrant les omoplates. Isole le travail des rhomboïdes et des deltoïdes postérieurs sans aucun matériel. Excellent pour la posture et l'activation du haut du dos.",
      },
    ],
    tips: [
      'Choisissez une table bien stable et solide — testez-la avant de vous suspendre dessous',
      'Serrez les omoplates en haut du mouvement et maintenez la contraction une seconde avant de redescendre',
      "Plus vos pieds sont avancés (corps horizontal), plus l'exercice est difficile — ajustez en reculant les pieds pour réduire la charge",
      'Gardez le corps rigide comme une planche : les fessiers et les abdos restent contractés tout au long du mouvement',
    ],
    commonMistakes: [
      "Le bassin qui s'affaisse — le corps doit rester aligné comme en planche. Contractez les fessiers et les abdominaux.",
      'Les épaules qui montent vers les oreilles en tirant — abaissez les épaules et focalisez-vous sur le rapprochement des omoplates',
      "L'amplitude incomplète — descendez bras tendus et montez poitrine contre la table. Les demi-répétitions ne comptent pas.",
      "Les coudes qui s'écartent à 90° du corps — gardez-les à 45° maximum pour protéger les épaules et cibler les bons muscles",
      "Utiliser l'élan en balançant les hanches — le mouvement doit être lent et contrôlé, seuls les bras et le dos travaillent",
    ],
  },

  // ─── Bas du corps ───────────────────────────────────────────────
  {
    slug: 'squats',
    name: 'Squats',
    aliases: ['Squat', 'Flexion de jambes', 'Jump squats', 'Speed squats'],
    category: 'lower',
    muscles: ['Quadriceps', 'Fessiers', 'Ischio-jambiers', 'Core (stabilisation)'],
    difficulty: 1,
    image: '/images/explosive.webp',
    video: '/videos/squats.mp4',
    shortDescription:
      "Le mouvement roi du bas du corps. Le squat est un patron moteur fondamental qui sollicite l'ensemble de la chaîne inférieure : cuisses, fessiers et tronc. C'est le mouvement que vous faites chaque fois que vous vous asseyez et vous relevez.",
    execution:
      "Debout, pieds écartés à largeur d'épaules ou légèrement plus, pointes de pieds tournées vers l'extérieur (15-30°). Initiez le mouvement en poussant les hanches vers l'arrière comme pour vous asseoir sur une chaise. Descendez en gardant le poids sur les talons et le milieu du pied, genoux alignés avec les pointes de pieds. Descendez au moins jusqu'à ce que les cuisses soient parallèles au sol (ou plus bas si votre mobilité le permet). Poussez dans le sol pour remonter en contractant les fessiers en haut du mouvement.",
    breathing:
      'Inspirez profondément pendant la descente (le ventre se gonfle), expirez puissamment pendant la remontée. Sur les séries lourdes ou intenses, prenez une inspiration avant de descendre et expirez en passant le point le plus difficile de la remontée.',
    benefits: [
      "Renforce l'ensemble du bas du corps : quadriceps, fessiers, ischio-jambiers",
      'Améliore la mobilité des hanches, genoux et chevilles',
      "Mouvement fonctionnel essentiel : s'asseoir, se relever, porter des charges",
      'Sollicite fortement le gainage du tronc pour maintenir le dos droit',
      'Stimule une réponse hormonale importante grâce à la masse musculaire engagée',
    ],
    variants: [
      {
        name: 'Squats sumo',
        description:
          "Pieds très écartés, pointes vers l'extérieur. Cible davantage les adducteurs (intérieur des cuisses) et les fessiers. Plus facile en termes de mobilité de cheville.",
      },
      {
        name: 'Squats pulse',
        description:
          'Rester dans la partie basse du squat et effectuer de petits mouvements de rebond. Augmente le temps sous tension et brûle les quadriceps.',
      },
      {
        name: 'Squats sautés',
        description:
          'Ajouter un saut explosif à la remontée. Développe la puissance et le cardio. Réservé aux pratiquants sans problèmes articulaires aux genoux.',
      },
      {
        name: 'Pistol squat assisté',
        description:
          "Squat sur une jambe en se tenant à un support. Travaille l'équilibre, la force unilatérale et la mobilité. Objectif avancé à construire progressivement.",
      },
      {
        name: 'Squats 1.5',
        description:
          'Descente complète, remontée à mi-chemin, redescente, puis remontée complète — ça compte pour une seule répétition. Augmente considérablement le temps sous tension dans la partie basse du mouvement.',
      },
      {
        name: 'Pop squats',
        description:
          'Sautez pour écarter les pieds en squat large, puis sautez pour les ramener serrés. Combine travail cardio et renforcement des jambes dans un mouvement dynamique et rythmé.',
      },
      {
        name: 'Goblet squat (sans poids)',
        description:
          'Mains jointes devant la poitrine, coudes poussés entre les genoux en bas du mouvement. Aide à maintenir le buste droit et à gagner en profondeur de squat — excellent outil de correction technique.',
      },
      {
        name: 'Sissy squat',
        description:
          "Penchez le buste en arrière, poussez les genoux vers l'avant, talons décollés. Isole intensément les quadriceps. Mouvement avancé qui demande un bon équilibre et des genoux en bonne santé.",
      },
      {
        name: 'Wall sit',
        description:
          "Dos plaqué contre un mur, cuisses parallèles au sol, maintien en isométrie. Défi d'endurance pure pour les quadriceps — simple en apparence, redoutable après 30 secondes.",
      },
    ],
    tips: [
      "Poussez les genoux vers l'extérieur pendant la descente — ils ne doivent jamais rentrer vers l'intérieur",
      'Gardez le poids sur les talons : vous devez pouvoir remuer les orteils à tout moment',
      'Le dos reste droit et la poitrine ouverte. Imaginez que vous portez un logo sur le torse et que tout le monde doit le voir',
      'Descendez au moins cuisses parallèles — les quarts de squat ne développent ni la force ni la mobilité',
    ],
    commonMistakes: [
      "Les genoux qui rentrent vers l'intérieur (valgus) — activez consciemment les fessiers pour pousser les genoux dehors",
      "Les talons qui décollent du sol — signe d'un manque de mobilité de cheville. Travaillez la mobilité ou placez un petit support sous les talons",
      "Le buste qui tombe trop vers l'avant — renforcez le haut du dos et le gainage. Essayez les squats goblet pour corriger",
      "L'amplitude insuffisante — descendre à moitié prive le mouvement de ses principaux bénéfices",
      'La vitesse excessive — contrôlez la descente (2-3 secondes) avant de remonter de manière dynamique',
    ],
  },
  {
    slug: 'fentes',
    name: 'Fentes avant',
    aliases: ['Fentes', 'Lunges', 'Fentes alternees', 'Jump lunges', 'Jumping lunges'],
    category: 'lower',
    muscles: ['Quadriceps', 'Fessiers', 'Ischio-jambiers', 'Mollets', 'Core (stabilisation)'],
    difficulty: 2,
    image: '/images/lower.webp',
    shortDescription:
      "Le mouvement unilatéral incontournable pour des jambes puissantes et équilibrées. Les fentes sollicitent quadriceps, fessiers et ischio-jambiers tout en travaillant l'équilibre et la stabilité du bassin — un exercice complet qui corrige les déséquilibres entre jambe droite et jambe gauche.",
    execution:
      "Debout, pieds écartés à largeur de hanches, regard droit devant. Faites un grand pas en avant avec une jambe en gardant le buste droit et les abdos contractés. Fléchissez les deux genoux simultanément jusqu'à ce que le genou arrière frôle le sol (les deux genoux forment un angle d'environ 90°). Le genou avant reste aligné avec la pointe du pied, sans dépasser excessivement les orteils. Poussez fermement dans le talon du pied avant pour revenir à la position de départ. Alternez les jambes ou enchaînez toutes les répétitions d'un même côté selon la variante choisie.",
    breathing:
      "Inspirez pendant la descente en contrôlant le mouvement, expirez en poussant pour remonter. Gardez une respiration régulière et profonde — ne bloquez jamais le souffle, surtout en fin de série quand la fatigue s'installe.",
    benefits: [
      'Développe la force unilatérale et corrige les déséquilibres musculaires entre les deux jambes',
      'Sollicite intensément les fessiers, souvent sous-activés dans les mouvements bilatéraux comme le squat',
      "Améliore l'équilibre, la proprioception et la stabilité du bassin",
      'Renforce la mobilité des hanches et la souplesse des fléchisseurs de hanche',
      "Transfert direct vers la marche, la course, la montée d'escaliers et les changements de direction",
    ],
    variants: [
      {
        name: 'Fentes alternées',
        description:
          'Un pas en avant jambe droite, retour, puis un pas en avant jambe gauche. Permet de travailler les deux côtés de manière équilibrée dans la même série. Le retour à la position debout entre chaque répétition ajoute un travail de stabilisation.',
      },
      {
        name: 'Fentes arrière',
        description:
          "Le pas se fait vers l'arrière au lieu de vers l'avant. Plus douce pour les genoux car le poids reste naturellement sur le talon de la jambe d'appui. Idéale pour les pratiquants ayant des sensibilités au niveau des rotules.",
      },
      {
        name: 'Fentes avec pause',
        description:
          "Maintenez la position basse pendant 2 à 3 secondes avant de remonter. La pause élimine l'élan et augmente le temps sous tension, ce qui intensifie le travail musculaire des quadriceps et des fessiers.",
      },
      {
        name: 'Fentes bulgares',
        description:
          "Le pied arrière est surélevé sur une chaise ou un banc. Augmente considérablement la charge sur la jambe avant et l'étirement du fléchisseur de hanche arrière. Variante exigeante en force et en équilibre, réservée aux pratiquants à l'aise avec les fentes classiques.",
      },
      {
        name: 'Fentes curtsy',
        description:
          "Le pied arrière se croise derrière la jambe d'appui, comme une révérence. Cible davantage le moyen fessier et les adducteurs, travaillant la stabilité latérale du bassin dans un plan de mouvement rarement sollicité.",
      },
      {
        name: 'Fentes latérales',
        description:
          "Le pas se fait sur le côté au lieu de vers l'avant. Sollicite les adducteurs et les abducteurs en plus des quadriceps et fessiers. Excellent pour la mobilité des hanches et la préparation aux sports impliquant des déplacements latéraux.",
      },
      {
        name: 'Fentes marchées',
        description:
          "Enchaînez les fentes en avançant à chaque pas, comme une marche. Le mouvement continu ajoute un défi d'équilibre dynamique et augmente la composante cardiovasculaire de l'exercice. Nécessite un espace de quelques mètres.",
      },
      {
        name: 'Fentes sautées',
        description:
          "Effectuez un saut pour changer de jambe en position basse. Version plyométrique qui développe l'explosivité et fait monter le cardio rapidement. Réservée aux pratiquants maîtrisant parfaitement les fentes classiques et n'ayant aucune douleur articulaire.",
      },
    ],
    tips: [
      "Gardez le buste droit et le regard devant vous — la tendance naturelle est de se pencher vers l'avant quand la fatigue arrive",
      "Le genou avant doit rester aligné avec le deuxième orteil : s'il rentre vers l'intérieur, activez consciemment le fessier",
      'Faites un pas suffisamment long : un pas trop court met trop de pression sur le genou avant, un pas trop long déséquilibre',
      "Si l'équilibre est un problème, commencez par les fentes arrière ou posez les mains sur les hanches pour abaisser le centre de gravité",
    ],
    commonMistakes: [
      "Le genou avant qui dépasse largement les orteils ou qui rentre vers l'intérieur — raccourcissez le pas et poussez le genou vers l'extérieur",
      "Le buste qui s'incline vers l'avant — gardez la poitrine ouverte et les épaules au-dessus des hanches",
      'Le pas trop court qui transforme la fente en squat partiel — le tibia avant doit être quasi vertical en position basse',
      'Le pied arrière à plat au sol — seule la pointe du pied arrière touche le sol, le talon reste décollé',
      'La descente trop rapide et non contrôlée — contrôlez la phase excentrique sur 2 secondes pour protéger les genoux et maximiser le travail musculaire',
    ],
  },
  {
    slug: 'glute-bridge',
    name: 'Glute bridge',
    aliases: ['Pont fessier', 'Hip thrust au sol'],
    category: 'lower',
    muscles: ['Fessiers', 'Ischio-jambiers', 'Core (stabilisation)'],
    difficulty: 1,
    image: '/images/lower.webp',
    shortDescription:
      'Le mouvement de référence pour activer et renforcer les fessiers. Allongé au sol, vous soulevez le bassin en contractant les fessiers — un exercice simple, efficace et accessible à tous les niveaux.',
    execution:
      "Allongez-vous sur le dos, genoux fléchis, pieds à plat au sol écartés à largeur de hanches et positionnés de sorte que vos tibias soient verticaux en position haute. Bras le long du corps, paumes vers le sol. Poussez dans vos talons et contractez les fessiers pour soulever le bassin jusqu'à former une ligne droite des épaules aux genoux. Maintenez la contraction une seconde en haut en serrant les fessiers au maximum. Redescendez lentement sans poser complètement les fesses au sol entre chaque répétition pour maintenir la tension. Le mouvement vient des hanches — ne cambrez pas le bas du dos pour monter plus haut.",
    breathing:
      'Expirez en montant le bassin et en contractant les fessiers. Inspirez en redescendant de manière contrôlée. Cette respiration aide à engager le core et à stabiliser le mouvement.',
    benefits: [
      'Active et renforce les fessiers, souvent sous-utilisés à cause de la position assise prolongée',
      'Protège le bas du dos en renforçant la chaîne postérieure',
      'Améliore la stabilité du bassin et la posture en position debout',
      'Mouvement sans impact, accessible même en cas de douleurs articulaires',
      "Excellent exercice d'échauffement avant des mouvements plus intenses (squats, fentes)",
    ],
    variants: [
      {
        name: 'Glute bridge marché',
        description:
          "En position haute du pont, tendez une jambe devant vous puis reposez-la, et alternez. Cette variante ajoute un travail unilatéral et un défi d'équilibre qui intensifie l'activation des fessiers.",
      },
      {
        name: 'Hip thrust au sol',
        description:
          "Haut du dos appuyé sur un canapé ou un banc, pieds au sol, soulevez le bassin. L'amplitude de mouvement est plus grande et la position permet d'ajouter du poids (sac, haltère) sur les hanches pour progresser en charge.",
      },
      {
        name: 'Hip thrust unilatéral',
        description:
          "En position de hip thrust, une seule jambe au sol, l'autre tendue ou genou ramené vers la poitrine. Double la charge sur la jambe d'appui et révèle les déséquilibres de force entre les deux côtés.",
      },
    ],
    tips: [
      'Poussez à travers les talons, pas les orteils — vous devez pouvoir soulever les orteils du sol',
      'Serrez les fessiers au maximum en haut du mouvement et maintenez une seconde',
      'Ne cambrez pas le bas du dos pour monter plus haut — arrêtez-vous quand le corps forme une ligne droite',
      'Placez les pieds de sorte que les tibias soient verticaux en position haute pour maximiser le recrutement des fessiers',
    ],
    commonMistakes: [
      'Pousser avec les orteils au lieu des talons — transfère le travail vers les quadriceps au détriment des fessiers',
      'Cambrer le bas du dos en position haute — signe que le bassin monte trop haut. Arrêtez-vous quand le corps est aligné.',
      'Ne pas contracter les fessiers consciemment — le mouvement devient passif et les ischio-jambiers prennent le relais',
      "Les genoux qui s'écartent ou se rapprochent — gardez-les stables et alignés avec les pieds tout au long du mouvement",
      "Monter et descendre trop vite — contrôlez le tempo pour maximiser le temps sous tension et l'activation musculaire",
    ],
  },
  {
    slug: 'box-jumps',
    name: 'Box jumps (marche)',
    aliases: ['Box jumps', 'Sauts sur marche'],
    category: 'lower',
    muscles: ['Quadriceps', 'Fessiers', 'Mollets', 'Core'],
    difficulty: 2,
    image: '/images/explosive.webp',
    shortDescription:
      'Un exercice pliométrique accessible qui consiste à sauter sur une marche ou un support stable. Les box jumps développent la puissance explosive des jambes et la coordination tout en apprenant au corps à produire de la force rapidement.',
    execution:
      "Placez-vous face à une marche ou un support stable, pieds à largeur d'épaules, à environ 30 cm du bord. Fléchissez les genoux en envoyant les hanches vers l'arrière (comme un demi-squat) tout en balançant les bras en arrière. Poussez explosément dans le sol et balancez les bras vers l'avant et le haut pour propulser votre corps. Réceptionnez-vous sur la marche avec les deux pieds à plat, genoux fléchis pour amortir. Redressez-vous complètement en haut, hanches ouvertes. Redescendez en contrôle (un pied après l'autre ou en sautant légèrement en arrière) et enchaînez la répétition suivante.",
    breathing:
      'Prenez une inspiration rapide avant le saut, expirez pendant la phase de poussée et le vol. Respirez librement en haut de la marche avant de redescendre.',
    benefits: [
      'Développe la puissance explosive des membres inférieurs de manière fonctionnelle et progressive',
      'Améliore la coordination, le timing et la proprioception dynamique',
      'Renforce les quadriceps, les fessiers et les mollets en mode pliométrique',
      'Enseigne au corps à absorber les impacts correctement (qualité de réception)',
      "Progression naturelle : il suffit d'augmenter la hauteur de la marche pour monter en difficulté",
    ],
    variants: [
      {
        name: 'Broad jumps',
        description:
          "Saut en longueur debout vers l'avant. Développe la puissance horizontale et la capacité d'extension complète de la chaîne postérieure. Excellent pour le transfert vers les mouvements sportifs.",
      },
      {
        name: 'Tuck jumps',
        description:
          "Saut vertical avec les genoux ramenés vers la poitrine en l'air. Augmente le temps de vol et l'explosivité. Demande un bon gainage pour contrôler la position en vol.",
      },
      {
        name: 'Squat jumps',
        description:
          "Saut explosif vers le haut depuis une position de squat profond, sans support. Combine le travail de force du squat avec l'explosivité du saut. Très intense pour les quadriceps et les fessiers.",
      },
    ],
    tips: [
      'Commencez avec une marche basse (15-20 cm) et augmentez progressivement la hauteur',
      'Réceptionnez-vous avec les deux pieds en même temps, genoux fléchis — jamais en atterrissant sur un seul pied',
      'Utilisez le balancier des bras pour gagner en hauteur : ils jouent un rôle clé dans la propulsion',
      'Redescendez toujours en contrôle — pas de saut en arrière incontrôlé qui met les chevilles à risque',
    ],
    commonMistakes: [
      'Réception sur la pointe des pieds au bord de la marche — posez les pieds à plat et au centre du support pour la stabilité',
      "Les genoux qui rentrent vers l'intérieur à la réception — poussez les genoux vers l'extérieur en atterrissant, comme pour un squat",
      'Ne pas ouvrir les hanches en haut — redressez-vous complètement avant de redescendre, sinon le mouvement est incomplet',
      "Utiliser un support instable ou trop haut — la sécurité prime sur l'ego, choisissez une hauteur que vous maîtrisez",
      "Enchaîner les répétitions en tombant en arrière — redescendez de manière contrôlée à chaque fois pour préserver les tendons d'Achille",
    ],
  },
  {
    slug: 'good-morning',
    name: 'Good morning',
    aliases: ['Good mornings'],
    category: 'lower',
    muscles: ['Ischio-jambiers', 'Érecteurs du rachis', 'Fessiers'],
    difficulty: 2,
    image: '/images/lower.webp',
    shortDescription:
      'Un exercice de charnière de hanche qui cible la chaîne postérieure en profondeur. Le good morning renforce les ischio-jambiers, les érecteurs du rachis et les fessiers dans un mouvement de flexion contrôlée du buste — essentiel pour la santé du dos et la posture.',
    execution:
      "Debout, pieds à largeur d'épaules, genoux légèrement fléchis (jamais verrouillés). Placez les mains derrière la tête ou croisées sur la poitrine. En gardant le dos parfaitement droit et la poitrine ouverte, penchez le buste vers l'avant en poussant les hanches vers l'arrière, comme si vous vouliez toucher le mur derrière vous avec vos fessiers. Descendez jusqu'à sentir un étirement prononcé dans les ischio-jambiers (le buste arrive environ parallèle au sol selon votre souplesse). Contractez les fessiers et les ischio-jambiers pour remonter le buste en ramenant les hanches vers l'avant. Le mouvement part des hanches, jamais du bas du dos.",
    breathing:
      "Inspirez profondément en descendant le buste vers l'avant, expirez en remontant en contractant les fessiers. Gardez les abdominaux engagés tout au long du mouvement pour protéger la colonne vertébrale.",
    benefits: [
      'Renforce toute la chaîne postérieure : ischio-jambiers, érecteurs du rachis et fessiers',
      'Améliore la mobilité de hanche et la souplesse des ischio-jambiers en dynamique',
      'Enseigne le patron moteur de la charnière de hanche (hip hinge), fondamental pour soulever des charges au quotidien',
      'Prévient les douleurs lombaires en renforçant les muscles stabilisateurs du dos',
      'Prépare aux mouvements plus avancés comme le soulevé de terre et le kettlebell swing',
    ],
    variants: [
      {
        name: 'Romanian deadlift unilatéral',
        description:
          "Même mouvement de charnière de hanche mais sur une seule jambe, la jambe libre partant en arrière. Augmente considérablement le travail d'équilibre et la sollicitation des stabilisateurs de hanche.",
      },
      {
        name: 'Single leg deadlift',
        description:
          "Similaire au Romanian deadlift unilatéral avec un défi d'équilibre encore plus marqué. La jambe libre s'aligne avec le buste pour former une ligne horizontale. Excellent pour corriger les déséquilibres musculaires entre les deux côtés.",
      },
    ],
    tips: [
      'Gardez une légère flexion des genoux en permanence — les jambes tendues mettent trop de stress sur les lombaires',
      'Le mouvement vient des hanches, pas du dos : imaginez que vos hanches sont une charnière de porte',
      'Gardez le regard vers le sol à environ un mètre devant vous pour maintenir la nuque alignée avec la colonne',
      "Descendez uniquement jusqu'où votre dos reste droit — ne sacrifiez jamais la posture pour l'amplitude",
    ],
    commonMistakes: [
      "Le dos qui s'arrondit pendant la descente — signe que vous descendez trop bas ou que les ischio-jambiers manquent de souplesse. Réduisez l'amplitude.",
      'Les genoux verrouillés — gardez toujours une micro-flexion pour protéger les lombaires et permettre aux hanches de bouger librement',
      "Le mouvement qui part du bas du dos au lieu des hanches — poussez les fessiers vers l'arrière en premier, le buste suit naturellement",
      'La tête qui se relève pour regarder devant — gardez la nuque neutre, le regard suit le mouvement du buste',
      'Descente trop rapide et incontrôlée — contrôlez la descente sur 2-3 secondes pour maximiser le travail musculaire et protéger le dos',
    ],
  },

  // ─── Core ───────────────────────────────────────────────────────
  {
    slug: 'gainage-planche',
    name: 'Gainage planche',
    aliases: ['Planche', 'Plank', 'Gainage', 'Bear crawl', 'Hollow body hold'],
    category: 'core',
    muscles: ["Transverse de l'abdomen", 'Grand droit', 'Obliques', 'Deltoïdes', 'Érecteurs du rachis'],
    difficulty: 1,
    image: '/images/core.webp',
    shortDescription:
      "L'exercice de base pour un tronc solide et un dos protégé. Le gainage en planche renforce la sangle abdominale en profondeur sans aucun mouvement : il suffit de maintenir la position et de résister à la gravité. Un fondamental accessible à tous.",
    execution:
      "Au sol, placez-vous en appui sur les avant-bras et les pointes de pieds. Les coudes sont placés directement sous les épaules, les avant-bras parallèles ou les mains jointes devant vous. Le corps forme une ligne droite de la tête aux talons : contractez les abdominaux en rentrant le nombril vers la colonne vertébrale, serrez les fessiers et poussez les talons vers l'arrière. Le regard est dirigé vers le sol, entre les mains, nuque dans le prolongement de la colonne. Maintenez la position le temps indiqué en respirant régulièrement, sans jamais laisser le bassin s'affaisser ou monter.",
    breathing:
      'Respirez normalement et régulièrement par le nez et la bouche. La tendance naturelle est de bloquer le souffle — résistez : adoptez une respiration abdominale contrôlée, en gardant la contraction du transverse à chaque expiration.',
    benefits: [
      "Renforce le transverse de l'abdomen, le muscle profond essentiel à la stabilité du tronc",
      'Protège le bas du dos en améliorant le contrôle de la posture et la rigidité du caisson abdominal',
      "Sollicite l'ensemble du corps en isométrie : épaules, dos, fessiers et cuisses participent au maintien",
      'Aucun matériel nécessaire et risque de blessure très faible — accessible dès le premier jour',
      'Fondation indispensable pour tous les autres exercices : pompes, squats, burpees, et mouvements du quotidien',
    ],
    variants: [
      {
        name: 'Gainage latéral',
        description:
          'En appui sur un avant-bras et le bord extérieur du pied, corps de profil. Cible les obliques et le moyen fessier pour renforcer la stabilité latérale du tronc. Alternez les deux côtés pour un travail équilibré.',
      },
      {
        name: 'Gainage latéral sur genoux',
        description:
          "Version accessible du gainage latéral : en appui sur l'avant-bras et le genou plutôt que le pied. Réduit le bras de levier pour les débutants tout en travaillant les obliques et la stabilité latérale. Idéal pour construire la force avant de passer à la version complète.",
      },
      {
        name: 'Gainage Superman',
        description:
          "En position de planche classique, tendez les bras vers l'avant comme Superman en vol. Augmente considérablement le bras de levier et la difficulté en sollicitant davantage les érecteurs du rachis et les épaules.",
      },
      {
        name: 'Planche épaule',
        description:
          "En position de planche haute (bras tendus), touchez l'épaule opposée avec chaque main en alternance. Ajoute un défi anti-rotation : le tronc doit résister à la torsion pendant que vous levez une main.",
      },
      {
        name: 'Planche RKC',
        description:
          'Planche sur les avant-bras avec une contraction maximale de tout le corps : rapprochez les coudes des pieds (sans bouger), serrez les poings et contractez chaque muscle à fond. Beaucoup plus intense que la planche classique — 10 secondes en RKC valent 30 secondes en planche standard.',
      },
      {
        name: 'Bear hold',
        description:
          'À quatre pattes, mains sous les épaules, genoux sous les hanches, soulevez les genoux de 2-3 cm du sol et maintenez. Travaille le gainage dans une position raccourcie qui sollicite intensément les quadriceps et le transverse. Excellent exercice de transition avant la planche.',
      },
      {
        name: 'Hollow hold',
        description:
          'Allongé sur le dos, bras tendus au-dessus de la tête et jambes tendues, soulevez les épaules et les pieds du sol en pressant le bas du dos contre le sol. Position de gymnastique qui renforce puissamment le grand droit et le transverse en position allongée.',
      },
      {
        name: 'Planche to downward dog',
        description:
          "En position de planche haute, poussez les hanches vers le haut et l'arrière pour passer en position du chien tête en bas, puis revenez en planche. L'alternance travaille la mobilité des épaules, la souplesse des ischio-jambiers et le gainage dynamique. Excellent mouvement de transition en échauffement.",
      },
    ],
    tips: [
      "Pensez à pousser le sol loin de vous avec les avant-bras — cet engagement actif des épaules protège l'articulation et augmente le recrutement musculaire",
      "Contractez les fessiers aussi fort que les abdos : ce sont eux qui empêchent le bassin de basculer vers l'avant",
      'Préférez plusieurs séries courtes avec une bonne forme (4 x 20 s) à une longue série où la posture se dégrade',
      "Si vous tremblez, c'est normal et signe que les muscles travaillent — si le dos se creuse, arrêtez et reposez-vous",
    ],
    commonMistakes: [
      "Le bassin qui s'affaisse vers le sol (dos creux) — le signe le plus courant de fatigue. Contractez les abdos et les fessiers ou arrêtez la série.",
      "Les fesses qui montent en pic — facilite l'exercice mais supprime le travail du gainage. Le corps doit rester en ligne droite.",
      'Les coudes placés trop en avant des épaules — crée une contrainte excessive sur les épaules. Les coudes doivent être directement sous les articulations.',
      "La tête qui se relève pour regarder devant soi — comprime les cervicales. Gardez le regard vers le sol, nuque neutre dans l'axe de la colonne.",
      'Bloquer la respiration — augmente la pression sanguine et limite la durée du maintien. Respirez calmement et régulièrement.',
    ],
  },
  {
    slug: 'crunchs',
    name: 'Crunchs',
    aliases: ['Crunch', 'Abdominaux', 'Crunchs vélo'],
    category: 'core',
    muscles: ["Grand droit de l'abdomen", 'Obliques'],
    difficulty: 1,
    image: '/images/core.webp',
    shortDescription:
      'Le mouvement de base pour cibler les abdominaux. Le crunch isole le grand droit grâce à une flexion courte et contrôlée du tronc, sans élan ni traction sur la nuque. Simple en apparence, il demande une vraie connexion esprit-muscle pour être efficace.',
    execution:
      "Allongez-vous sur le dos, genoux fléchis, pieds à plat au sol à largeur de hanches. Placez les mains derrière la tête (doigts qui effleurent les oreilles, sans tirer sur la nuque) ou croisées sur la poitrine. Contractez les abdominaux pour décoller les épaules et le haut du dos du sol en enroulant le buste vers le bassin. Montez jusqu'à sentir une contraction maximale des abdos (environ 30 degrés), marquez un temps d'arrêt en haut, puis redescendez lentement sans reposer complètement les épaules au sol. Le bas du dos reste plaqué au sol pendant tout le mouvement.",
    breathing:
      "Expirez en montant (soufflez fort, ventre rentré vers la colonne) et inspirez en redescendant. L'expiration forcée sur la contraction active le transverse et maximise le recrutement des abdominaux.",
    benefits: [
      "Isole efficacement le grand droit de l'abdomen sans matériel",
      'Renforce la sangle abdominale pour une meilleure posture au quotidien',
      "Mouvement accessible qui s'adapte à tous les niveaux grâce à ses nombreuses variantes",
      'Faible stress articulaire comparé aux sit-ups complets',
      'Améliore la connexion esprit-muscle sur la zone abdominale',
    ],
    variants: [
      {
        name: 'Bicycle crunchs',
        description:
          'En position de crunch, amenez le coude droit vers le genou gauche pendant que la jambe droite se tend, puis alternez. Le pédalage rotatif sollicite intensément les obliques en plus du grand droit.',
      },
      {
        name: 'Sit-ups',
        description:
          "Remontée complète du buste jusqu'en position assise, le dos décolle entièrement du sol. Mouvement plus complet qui recrute les fléchisseurs de hanche en plus des abdominaux, mais plus exigeant pour le bas du dos.",
      },
      {
        name: 'V-ups',
        description:
          'Les jambes et le buste montent simultanément pour former un V, les mains cherchent à toucher les pieds. Variante avancée qui demande force abdominale et souplesse des ischio-jambiers.',
      },
      {
        name: 'Russian twists',
        description:
          "Assis en équilibre sur les fessiers, pieds décollés du sol, effectuez des rotations du buste de gauche à droite. Cible les obliques et le transverse avec un travail d'antirotation dynamique.",
      },
      {
        name: 'Toe touches',
        description:
          'Allongé sur le dos, jambes tendues à la verticale, montez les mains pour toucher les orteils. Le mouvement court et ciblé isole la partie haute du grand droit avec une contraction intense.',
      },
    ],
    tips: [
      "Gardez un espace d'un poing entre le menton et la poitrine pour protéger la nuque",
      'Concentrez-vous sur le rapprochement des côtes vers le bassin, pas sur la hauteur de la montée',
      "Maintenez le bas du dos collé au sol : s'il se cambre, c'est que les abdos ont lâché",
      'Ralentissez la descente (2-3 secondes) pour doubler le temps sous tension',
    ],
    commonMistakes: [
      'Tirer sur la nuque avec les mains — relâchez la pression des doigts, ils ne font que soutenir la tête sans la tirer',
      'Monter trop haut en décollant les lombaires — le crunch est un mouvement court, pas un sit-up',
      "Utiliser l'élan pour enchaîner les répétitions — chaque montée doit être initiée par la contraction abdominale, pas par un balancier",
      "Gonfler le ventre en montant — le ventre doit se creuser vers l'intérieur à l'effort pour engager le transverse",
      'Reposer complètement les épaules entre chaque répétition — gardez une tension continue en restant légèrement décollé',
    ],
  },
  {
    slug: 'superman',
    name: 'Superman',
    aliases: ['Superman alterne', 'Back extension au sol'],
    category: 'core',
    muscles: ['Erecteurs du rachis', 'Fessiers', 'Trapèzes', 'Rhomboïdes', 'Deltoïdes postérieurs'],
    difficulty: 1,
    image: '/images/core.webp',
    shortDescription:
      "L'antidote aux heures passées assis. Le superman renforce toute la chaîne postérieure en un seul mouvement au sol. En soulevant bras et jambes simultanément, vous travaillez les érecteurs du rachis, les fessiers et le haut du dos pour un dos solide et une posture redressée.",
    execution:
      "Allongez-vous face au sol, bras tendus devant vous (position \"superman en vol\"), jambes tendues et serrées. Le front peut reposer sur le sol ou rester légèrement décollé. Contractez simultanément les fessiers et les muscles du dos pour soulever les bras, la poitrine et les jambes du sol. Montez aussi haut que votre mobilité le permet sans forcer dans les lombaires, en gardant le regard vers le sol (nuque neutre). Tenez la position haute 1 à 2 secondes en serrant les omoplates l'une vers l'autre, puis redescendez lentement. Le mouvement part des fessiers et du dos, pas d'un coup de rein.",
    breathing:
      'Inspirez en position basse pour préparer le mouvement, expirez en montant tout en contractant le dos et les fessiers. Maintenez une respiration fluide si vous tenez la position en isométrie.',
    benefits: [
      'Renforce toute la chaîne postérieure : érecteurs du rachis, fessiers, haut du dos',
      'Corrige la posture en contrebalançant les effets de la position assise prolongée',
      "Prévient les douleurs lombaires en développant l'endurance des muscles stabilisateurs du rachis",
      "Aucun matériel nécessaire, peut se pratiquer sur n'importe quelle surface plane",
      'Améliore la proprioception et la coordination entre le haut et le bas du corps',
    ],
    variants: [
      {
        name: 'Superman alterné',
        description:
          'Soulevez le bras droit et la jambe gauche simultanément, puis alternez. Réduit la difficulté et ajoute un travail de stabilisation anti-rotation du bassin.',
      },
      {
        name: 'Back extensions',
        description:
          'Seul le haut du corps se soulève, les jambes restent au sol. Concentre le travail sur les érecteurs du rachis et le haut du dos, idéal pour les débutants ou en pré-fatigue.',
      },
      {
        name: 'Reverse hyper sur table',
        description:
          "Allongé sur le ventre au bord d'une table, hanches en appui, soulevez les jambes vers l'horizontal. Cible les fessiers et les lombaires avec une amplitude accrue et sans compression discale.",
      },
      {
        name: 'Reverse snow angels',
        description:
          'En position de superman maintenue, effectuez un arc de cercle avec les bras, du devant vers les hanches et retour. Le mouvement continu sous tension brûle les rhomboïdes et les trapèzes.',
      },
      {
        name: 'Prone T raises',
        description:
          'Face au sol, bras écartés sur les côtés, soulevez-les pour former un T. Cible spécifiquement les trapèzes moyens et les rhomboïdes, parfait pour corriger les épaules enroulées.',
      },
      {
        name: 'Prone Y raises',
        description:
          "Face au sol, bras tendus vers l'avant à 45 degrés, soulevez-les pour former un Y. Recrute les trapèzes inférieurs et les deltoïdes postérieurs, renforçant la stabilité de l'omoplate.",
      },
    ],
    tips: [
      'Gardez le regard vers le sol pour maintenir la nuque neutre — ne levez pas la tête pour regarder devant',
      'Serrez les omoplates en haut du mouvement comme si vous vouliez coincer un crayon entre elles',
      'Initiez le mouvement par les fessiers, pas par une cambrure excessive des lombaires',
      'Commencez par la variante alternée si le superman complet provoque des tensions dans le bas du dos',
    ],
    commonMistakes: [
      'Lever la tête pour regarder devant soi — crée une hyperextension cervicale. Gardez le regard au sol, nuque dans le prolongement de la colonne.',
      "Forcer la montée en cambrant excessivement les lombaires — la hauteur vient de la contraction musculaire, pas d'un coup de rein. Limitez l'amplitude si nécessaire.",
      'Plier les genoux pour monter les jambes plus haut — gardez les jambes tendues et laissez les fessiers faire le travail',
      'Relâcher les bras entre les répétitions — maintenez une légère tension dans le haut du dos même en position basse',
      "Aller trop vite sans contrôler le mouvement — le superman est un exercice de contrôle, pas de vitesse. Marquez un temps d'arrêt en haut.",
    ],
  },
  {
    slug: 'leg-raises',
    name: 'Leg raises',
    aliases: ['Relevés de jambes'],
    category: 'core',
    muscles: ['Grand droit (portion basse)', 'Fléchisseurs de hanche', 'Obliques (stabilisation)'],
    difficulty: 2,
    image: '/images/core.webp',
    shortDescription:
      "L'exercice de référence pour cibler la partie basse des abdominaux. Le leg raise demande un contrôle réel du bassin pour empêcher le dos de se cambrer, ce qui en fait un mouvement bien plus technique qu'il n'y paraît.",
    execution:
      "Allongez-vous sur le dos, bras le long du corps (paumes vers le sol) ou mains glissées sous les fessiers pour stabiliser le bassin. Jambes tendues et serrées, décollez les pieds du sol de quelques centimètres. En gardant le bas du dos plaqué au sol, montez les jambes tendues à la verticale (90 degrés) en contractant les abdominaux. Redescendez lentement, en contrôlant la descente sur 3 à 4 secondes, jusqu'à ce que les pieds frôlent le sol sans le toucher. Si les jambes tendues sont trop difficiles, pliez légèrement les genoux pour réduire le bras de levier. La clé du mouvement est de ne jamais laisser le bas du dos décoller du sol.",
    breathing:
      "Expirez en montant les jambes (ventre creux, bas du dos plaqué), inspirez en redescendant. L'expiration forcée en montée aide à maintenir la rétroversion du bassin et protège les lombaires.",
    benefits: [
      'Cible la portion basse du grand droit, souvent sous-développée par rapport à la portion haute',
      'Renforce les fléchisseurs de hanche, essentiels pour la course et la marche',
      'Développe le contrôle du bassin et la stabilisation lombaire',
      'Progression naturelle vers des mouvements avancés (toes-to-bar, L-sit)',
      'Améliore la conscience corporelle et la proprioception de la zone lombo-pelvienne',
    ],
    variants: [
      {
        name: 'Flutter kicks',
        description:
          'Jambes tendues à quelques centimètres du sol, effectuez de petits battements alternés rapides. Le maintien continu sous tension avec le bas du dos plaqué au sol brûle les abdominaux et les fléchisseurs de hanche.',
      },
      {
        name: 'Scissors',
        description:
          "Jambes tendues décollées du sol, croisez-les en alternance comme des ciseaux. Le mouvement de croisement ajoute une composante d'adduction et un travail des obliques à l'effort de maintien abdominal.",
      },
    ],
    tips: [
      'Placez les mains sous les fessiers si votre dos se cambre — cela aide à maintenir la rétroversion du bassin',
      "Contrôlez la descente : c'est la phase excentrique qui construit la force. Si les jambes tombent, c'est trop lourd.",
      'Ne touchez jamais le sol avec les pieds entre les répétitions pour garder la tension continue',
      "Pliez légèrement les genoux si les jambes tendues provoquent des tensions dans le bas du dos — la qualité du mouvement prime sur l'amplitude",
    ],
    commonMistakes: [
      "Le bas du dos qui se cambre à la descente — c'est l'erreur la plus courante et la plus dangereuse. Réduisez l'amplitude ou pliez les genoux tant que vous ne contrôlez pas la position du bassin.",
      "Utiliser l'élan pour remonter les jambes — chaque montée doit être initiée par la contraction abdominale, pas par un balancement",
      "Laisser les jambes tomber sous la gravité — la descente doit durer 3-4 secondes minimum. Si vous ne contrôlez pas, réduisez l'amplitude.",
      'Tirer sur la nuque ou lever la tête — gardez la tête posée au sol, nuque détendue, le travail est dans les abdos pas dans le cou',
      "Retenir sa respiration par réflexe — l'apnée augmente la pression intra-abdominale de manière incontrôlée et empêche un gainage efficace",
    ],
  },
  {
    slug: 'dead-bug',
    name: 'Dead bug',
    aliases: ['Bird dog'],
    category: 'core',
    muscles: ["Transverse de l'abdomen", 'Grand droit', 'Obliques', 'Fléchisseurs de hanche'],
    difficulty: 1,
    image: '/images/core.webp',
    shortDescription:
      'Un exercice de gainage anti-extension allongé sur le dos. Le dead bug apprend au corps à stabiliser le tronc pendant que les bras et les jambes bougent — exactement ce que fait le core dans la vie quotidienne et le sport.',
    execution:
      "Allongez-vous sur le dos, bras tendus vers le plafond à la verticale des épaules, genoux fléchis à 90° au-dessus des hanches (tibias parallèles au sol). Avant de bouger, plaquez le bas du dos contre le sol en contractant les abdominaux — ce contact ne doit jamais se perdre. Tendez simultanément le bras droit au-dessus de la tête et la jambe gauche vers le sol, sans que l'un ou l'autre ne touche le sol. Ramenez-les à la position de départ puis répétez du côté opposé. Le mouvement est lent et contrôlé — chaque répétition dure 3 à 4 secondes. Si le bas du dos décolle du sol, réduisez l'amplitude du mouvement.",
    breathing:
      'Expirez lentement en tendant le bras et la jambe opposés — cette expiration aide à maintenir le bas du dos plaqué au sol. Inspirez en revenant à la position de départ.',
    benefits: [
      'Renforce le core en anti-extension, le schéma de stabilisation le plus fonctionnel',
      'Apprend la dissociation membres-tronc : bouger les bras et jambes sans compenser avec le dos',
      'Extrêmement doux pour le dos — recommandé en rééducation et en prévention des lombalgies',
      'Améliore la coordination controlatérale (bras droit / jambe gauche) essentielle en course et marche',
      "Excellent exercice d'échauffement pour préparer le core avant des mouvements plus intenses",
    ],
    variants: [],
    tips: [
      "Le bas du dos doit rester collé au sol en permanence — c'est LE critère de qualité du mouvement",
      "Allez lentement : 3-4 secondes par extension, 2 secondes pour revenir. La vitesse est l'ennemi du dead bug.",
      "Si vous n'arrivez pas à maintenir le dos au sol, réduisez l'amplitude : ne descendez pas le bras et la jambe aussi loin",
      "Concentrez-vous sur l'expiration pendant l'extension — elle verrouille naturellement la position du tronc",
    ],
    commonMistakes: [
      "Le bas du dos qui décolle du sol — signe que l'amplitude est trop grande ou que le core n'est pas assez engagé. Réduisez le mouvement.",
      'Aller trop vite — le dead bug est un exercice de contrôle, pas de vitesse. Chaque répétition doit être délibérée.',
      'Bouger le bras et la jambe du même côté (homolatéral) au lieu du côté opposé (controlatéral)',
      "Retenir sa respiration — l'expiration pendant l'extension est essentielle pour maintenir la stabilité du tronc",
      "Négliger la phase de retour — ramenez le bras et la jambe avec le même contrôle que l'extension",
    ],
  },

  // ─── Cardio ─────────────────────────────────────────────────────
  {
    slug: 'mountain-climbers',
    name: 'Mountain climbers',
    aliases: ['Mountain climber', 'Spider-Man mountain climbers'],
    category: 'cardio',
    muscles: ['Core', 'Épaules', 'Quadriceps', 'Fléchisseurs de hanche'],
    difficulty: 2,
    image: '/images/cardio.webp',
    shortDescription:
      'Un exercice cardio explosif réalisé en position de planche. Les mountain climbers combinent gainage, travail des jambes et endurance cardiovasculaire dans un mouvement rapide et rythmé qui fait grimper la fréquence cardiaque en quelques secondes.',
    execution:
      "Placez-vous en position de planche haute : mains sous les épaules, bras tendus, corps aligné de la tête aux talons. Ramenez un genou vers la poitrine en contractant les abdominaux, puis renvoyez-le en arrière tout en ramenant simultanément l'autre genou vers la poitrine. Alternez rapidement les jambes dans un mouvement de course horizontale. Les hanches restent basses et stables — elles ne doivent ni monter en pic ni rebondir de haut en bas. Gardez les épaules au-dessus des poignets et le regard dirigé vers le sol, légèrement devant les mains.",
    breathing:
      "Adoptez un rythme respiratoire naturel et régulier, calqué sur le mouvement des jambes : inspirez sur un cycle de deux pas, expirez sur le suivant. Ne bloquez jamais votre respiration même quand le rythme s'accélère.",
    benefits: [
      'Fait monter la fréquence cardiaque très rapidement sans aucun matériel',
      'Renforce le gainage dynamique en sollicitant le core sous instabilité',
      'Travaille les fléchisseurs de hanche et les quadriceps en mode explosif',
      "Améliore la coordination et l'agilité grâce à l'alternance rapide des jambes",
      "S'intègre facilement dans un circuit ou un HIIT comme pic d'intensité",
    ],
    variants: [],
    tips: [
      "Commencez lentement pour bien maîtriser la position de planche avant d'accélérer",
      'Gardez les épaules verrouillées au-dessus des poignets — ne reculez pas le buste',
      'Contractez les abdos en permanence pour empêcher le bassin de rebondir',
      'Préférez un rythme régulier et soutenu à des accélérations incontrôlées suivies de pauses',
    ],
    commonMistakes: [
      'Les fesses qui montent en pic — signe que le core lâche. Abaissez les hanches au niveau des épaules.',
      'Les hanches qui rebondissent de haut en bas — gardez le bassin stable en contractant le ventre',
      'Les épaules qui reculent derrière les poignets — maintenez les mains directement sous les épaules',
      'Les pieds qui traînent au sol au lieu de décoller — ramenez les genoux avec énergie, comme une course',
      'La respiration bloquée — respirez de manière fluide et continue, même à haute intensité',
    ],
  },
  {
    slug: 'jumping-jacks',
    name: 'Jumping jacks',
    aliases: ['Jumping jack'],
    category: 'cardio',
    muscles: ['Deltoïdes', 'Mollets', 'Quadriceps', 'Adducteurs'],
    difficulty: 1,
    image: '/images/cardio.webp',
    shortDescription:
      "L'échauffement par excellence. Les jumping jacks combinent un saut avec un écartement simultané des bras et des jambes dans un mouvement rythmique qui active rapidement le système cardiovasculaire. Simple, efficace et accessible à tous les niveaux.",
    execution:
      "Debout, pieds joints, bras le long du corps. En un seul saut, écartez les pieds à environ une fois et demie la largeur des épaules tout en levant les bras latéralement au-dessus de la tête (les mains se touchent ou se rapprochent en haut). Revenez en position de départ d'un second saut : pieds joints, bras le long du corps. Le mouvement est fluide et continu, les bras et les jambes se synchronisent parfaitement. Réceptionnez-vous sur l'avant du pied avec les genoux légèrement fléchis pour amortir chaque saut.",
    breathing:
      "Inspirez en écartant les bras et les jambes, expirez en revenant en position de départ. Le rythme respiratoire s'adapte naturellement à la cadence du mouvement — gardez une respiration fluide et régulière.",
    benefits: [
      'Échauffement complet du corps en quelques secondes : active le cardio, les épaules et les jambes simultanément',
      'Améliore la coordination motrice bras-jambes et le sens du rythme',
      'Zéro matériel, zéro technique complexe : accessible dès la première séance',
      'Sollicite les adducteurs et les deltoïdes, souvent sous-travaillés dans les routines classiques',
      'Augmente rapidement la fréquence cardiaque pour préparer le corps à un effort plus intense',
    ],
    variants: [
      {
        name: 'Star jumps',
        description:
          "Saut explosif où bras et jambes s'écartent au maximum en l'air pour former une étoile. Plus intense que le jumping jack classique, cette variante développe la puissance et sollicite davantage les fessiers et les épaules.",
      },
    ],
    tips: [
      'Gardez les genoux légèrement fléchis à la réception pour protéger les articulations',
      'Les bras montent bien tendus sur les côtés, pas devant vous — le mouvement part des épaules',
      "Restez sur l'avant du pied, ne retombez jamais talons en premier",
      "Trouvez un rythme régulier et soutenable plutôt que d'accélérer au maximum dès le départ",
    ],
    commonMistakes: [
      "Retomber sur les talons — crée un impact excessif sur les genoux et les chevilles. Restez sur l'avant du pied.",
      'Les bras qui passent devant le corps au lieu de monter latéralement — réduit le travail des deltoïdes et casse le rythme',
      'Les genoux raides à la réception — fléchissez toujours légèrement les genoux pour absorber le choc',
      'Amplitude trop faible (les mains ne montent pas au-dessus de la tête) — faites le mouvement complet pour un travail efficace',
      "Rythme irrégulier ou saccadé — gardez une cadence constante et fluide pour maximiser l'effet cardiovasculaire",
    ],
  },
  {
    slug: 'high-knees',
    name: 'High knees',
    aliases: ['Montées de genoux', 'Montees de genoux moderees', 'Butt kicks', 'Sprint sur place', 'Talons-fesses', 'Skipping'],
    category: 'cardio',
    muscles: ['Fléchisseurs de hanche', 'Quadriceps', 'Mollets', 'Core'],
    difficulty: 2,
    image: '/images/cardio.webp',
    shortDescription:
      'Un exercice de cardio dynamique qui imite la course sur place avec les genoux montés haut. Les high knees travaillent intensément les fléchisseurs de hanche et le gainage tout en faisant grimper la fréquence cardiaque en quelques secondes.',
    execution:
      "Debout, pieds à largeur de hanches, bras fléchis à 90° comme en position de sprint. Montez un genou à hauteur de hanche (cuisse parallèle au sol ou plus haut) tout en poussant le bras opposé vers l'avant. Reposez le pied et enchaînez immédiatement avec l'autre jambe. Le mouvement est rapide et dynamique, semblable à une course sur place à haute fréquence. Restez sur la pointe des pieds, le tronc légèrement incliné vers l'avant et les abdominaux bien engagés pour stabiliser le bassin.",
    breathing:
      "Respirez de manière rythmique et courte, comme pendant un sprint : deux temps d'inspiration, deux temps d'expiration. Évitez de bloquer la respiration, même quand l'intensité monte.",
    benefits: [
      'Fait exploser la fréquence cardiaque en quelques secondes — parfait pour les intervalles haute intensité',
      'Renforce les fléchisseurs de hanche, un groupe musculaire clé pour la course et la mobilité quotidienne',
      'Travaille la coordination bras-jambes et la proprioception dynamique',
      'Sollicite fortement le gainage pour stabiliser le bassin à chaque montée de genou',
      'Améliore la vitesse de pied et la réactivité musculaire des membres inférieurs',
    ],
    variants: [
      {
        name: 'Talon-fesses',
        description:
          'Au lieu de monter les genoux, les talons viennent frapper les fessiers en arrière. Cible davantage les ischio-jambiers et les mollets tout en réduisant le stress sur les fléchisseurs de hanche.',
      },
    ],
    tips: [
      "Montez les genoux au minimum à hauteur de hanche — en dessous, l'exercice perd son intérêt",
      "Gardez le buste droit ou très légèrement penché vers l'avant, pas en arrière",
      'Utilisez vos bras activement : ils donnent le rythme et aident à la montée des genoux',
      'Commencez à un rythme modéré et augmentez progressivement la vitesse sur les premières répétitions',
    ],
    commonMistakes: [
      'Les genoux qui ne montent pas assez haut — la cuisse doit atteindre la parallèle au sol pour un travail efficace des fléchisseurs de hanche',
      'Le buste qui part en arrière pour compenser — signe que les fléchisseurs de hanche sont faibles. Réduisez la vitesse et gardez le tronc engagé.',
      'Retomber sur les talons — restez sur la pointe des pieds pour protéger les articulations et garder du dynamisme',
      "Les bras immobiles le long du corps — les bras opposés doivent accompagner le mouvement pour la coordination et l'équilibre",
      "Rythme trop rapide au détriment de l'amplitude — mieux vaut monter haut et un peu moins vite que de piétiner sans amplitude",
    ],
  },
  {
    slug: 'skaters',
    name: 'Skaters',
    aliases: ['Skater', 'Patineur', 'Speed skaters'],
    category: 'cardio',
    muscles: ['Fessiers', 'Quadriceps', 'Adducteurs', 'Mollets'],
    difficulty: 2,
    image: '/images/explosive.webp',
    shortDescription:
      "Un exercice de cardio latéral inspiré du mouvement du patineur de vitesse. Les skaters développent la puissance des jambes, l'équilibre unipodal et la stabilité de hanche dans un mouvement explosif et fluide.",
    execution:
      "Debout, transférez votre poids sur la jambe droite et poussez latéralement vers la gauche en décollant du sol. Réceptionnez-vous sur le pied gauche, genou légèrement fléchi, en amenant la jambe droite derrière la jambe d'appui (sans poser le pied au sol ou en le posant à peine). Simultanément, le bras droit vient vers l'avant et le bras gauche part en arrière, comme un patineur. Enchaînez immédiatement en poussant vers la droite. Le mouvement est continu, fluide et contrôlé : chaque réception est amortie par une flexion de genou avant de repartir dans l'autre direction.",
    breathing:
      'Expirez à chaque impulsion latérale, inspirez brièvement pendant la phase de vol. Le rythme respiratoire se cale naturellement sur les allers-retours.',
    benefits: [
      'Travaille la puissance latérale des jambes, un plan de mouvement souvent négligé dans les entraînements classiques',
      'Renforce les fessiers et les adducteurs en mode dynamique et fonctionnel',
      "Développe l'équilibre unipodal et la stabilité de hanche et de cheville",
      'Effet cardio élevé avec un faible impact par rapport aux sauts verticaux',
      "Améliore l'agilité et la capacité de changement de direction rapide",
    ],
    variants: [
      {
        name: 'Lateral bounds',
        description:
          "Sauts latéraux plus amples et plus explosifs, avec un temps de vol plus long. Développe davantage la puissance et l'explosivité des membres inférieurs. Nécessite une bonne stabilité de cheville.",
      },
      {
        name: 'Pas chassés',
        description:
          "Déplacement latéral en pas glissés sans phase de vol. Réduit l'impact articulaire tout en travaillant les adducteurs et la coordination latérale. Idéal pour l'échauffement ou les débutants.",
      },
    ],
    tips: [
      "Poussez fort avec la jambe d'appui dans le sol — c'est l'explosivité de cette poussée qui fait la qualité du mouvement",
      'Fléchissez le genou à la réception pour amortir et préparer la prochaine impulsion',
      "Gardez le buste légèrement penché vers l'avant, comme un vrai patineur — cela aide l'équilibre",
      'Commencez avec une amplitude modérée et augmentez progressivement la largeur des sauts',
    ],
    commonMistakes: [
      "Réception jambe tendue — fléchissez toujours le genou à l'atterrissage pour protéger les articulations et maintenir l'équilibre",
      "Le buste trop vertical — penchez-vous légèrement vers l'avant pour abaisser votre centre de gravité et améliorer la stabilité",
      'Amplitude trop faible (petits pas au lieu de vrais sauts latéraux) — poussez réellement dans le sol pour couvrir de la distance',
      "Les bras qui restent immobiles — utilisez le balancier naturel des bras pour l'équilibre et la puissance",
      "Le genou de réception qui s'effondre vers l'intérieur (valgus) — concentrez-vous sur l'alignement genou-pied à chaque atterrissage",
    ],
  },

  // ─── Full body ──────────────────────────────────────────────────
  {
    slug: 'burpees',
    name: 'Burpees',
    aliases: ['Burpee', 'Sprawls', 'Sprawl', 'Push-up burpees', 'Tuck jump burpees', 'Broad jump burpees'],
    category: 'full-body',
    muscles: ['Pectoraux', 'Quadriceps', 'Fessiers', 'Épaules', 'Triceps', 'Core'],
    difficulty: 3,
    image: '/images/cardio.webp',
    shortDescription:
      "L'exercice au poids du corps le plus complet et le plus redouté. Le burpee combine une pompe, un squat et un saut dans un mouvement fluide qui fait exploser le cardio et sollicite chaque muscle du corps.",
    execution:
      "Debout, pieds à largeur d'épaules. Descendez en squat et posez les mains au sol devant vous. Lancez les pieds vers l'arrière d'un bond pour arriver en position de pompe. Effectuez une pompe complète (poitrine au sol). Ramenez les pieds vers les mains d'un bond. Sautez verticalement en levant les bras au-dessus de la tête. Réceptionnez-vous souplement et enchaînez immédiatement la répétition suivante.",
    breathing:
      "Inspirez en descendant au sol, expirez en remontant du sol et pendant le saut. Le rythme respiratoire s'adapte naturellement à l'intensité — l'important est de ne jamais bloquer la respiration.",
    benefits: [
      'Travail complet du corps en un seul mouvement : poussée, squat, saut, gainage',
      "Développe simultanément la force, l'endurance et la puissance",
      'Effet cardio maximal : fait monter la fréquence cardiaque en quelques répétitions',
      'Brûle énormément de calories grâce à la sollicitation de grandes chaînes musculaires',
      "Aucun matériel, très peu d'espace nécessaire",
    ],
    variants: [
      {
        name: 'Burpees sans pompe',
        description:
          "On saute en planche et on revient sans effectuer la pompe. Réduit la difficulté tout en gardant l'effet cardio. Bon point de départ pour construire l'endurance.",
      },
      {
        name: 'Burpees sans saut',
        description:
          "On remplace le saut final par une simple extension debout. Moins d'impact sur les articulations, idéal en appartement ou pour les pratiquants avec des sensibilités aux genoux.",
      },
      {
        name: 'Burpees avec tuck jump',
        description:
          "Le saut final est remplacé par un saut genoux poitrine. Version avancée qui augmente l'explosivité et la demande cardiovasculaire.",
      },
    ],
    tips: [
      'Trouvez un rythme soutenable. Mieux vaut un rythme régulier que 5 burpees rapides suivis de 30 secondes à reprendre son souffle',
      "La pompe doit être complète — si vous n'y arrivez plus, passez aux burpees sans pompe plutôt que de tricher",
      "Réceptionnez-vous souplement sur l'avant du pied, pas les jambes raides",
      'Gardez les abdos contractés pendant toute la phase au sol pour protéger le bas du dos',
    ],
    commonMistakes: [
      "Sauter la pompe ou faire une demi-pompe — c'est une partie intégrante du mouvement",
      'Le dos qui se creuse en position de planche — gainez le tronc avant de lancer les pieds en arrière',
      "Se réceptionner jambes tendues après le saut — fléchissez les genoux pour absorber l'impact",
      "Partir trop vite et s'effondrer après 4-5 reps — le burpee est un marathon, pas un sprint",
      "Oublier de respirer — l'apnée d'effort est le piège numéro un sur cet exercice",
    ],
  },
  {
    slug: 'inchworms',
    name: 'Inchworms',
    aliases: ['Inchworm'],
    category: 'full-body',
    muscles: ['Épaules', 'Core', 'Ischio-jambiers (souplesse)', 'Pectoraux'],
    difficulty: 1,
    image: '/images/fullbody.webp',
    shortDescription:
      "Un exercice de mobilité dynamique qui combine marche des mains et étirement des ischio-jambiers. L'inchworm réchauffe tout le corps en passant de la position debout à la planche et retour — parfait en échauffement ou en récupération active.",
    execution:
      "Debout, pieds joints ou légèrement écartés. Penchez-vous en avant et posez les mains au sol devant vos pieds (fléchissez les genoux si nécessaire pour atteindre le sol). Avancez les mains pas à pas jusqu'à arriver en position de planche haute, corps aligné de la tête aux talons. Marquez un temps d'arrêt en planche, épaules au-dessus des poignets. Puis ramenez les pieds vers les mains en marchant à petits pas, jambes aussi tendues que possible pour étirer les ischio-jambiers. Redressez-vous à la position debout et enchaînez la répétition suivante. Chaque transition main-pied doit être fluide et contrôlée.",
    breathing:
      "Inspirez en marchant les mains vers l'avant, expirez en ramenant les pieds vers les mains. Maintenez un rythme respiratoire calme et régulier — cet exercice n'est pas un sprint.",
    benefits: [
      "Échauffe l'ensemble du corps en un seul mouvement fluide : épaules, core, ischio-jambiers",
      'Améliore la souplesse dynamique des ischio-jambiers et des mollets',
      'Renforce les épaules et le core en position de planche à chaque répétition',
      'Prépare les articulations et les muscles à des mouvements plus intenses',
      'Mouvement lent et contrôlé qui peut servir de récupération active entre des séries intenses',
    ],
    variants: [],
    tips: [
      "Gardez les jambes aussi tendues que possible en ramenant les pieds — c'est là que se fait l'étirement",
      "Ne vous précipitez pas : l'inchworm est un exercice de mobilité, pas de vitesse",
      'En position de planche, vérifiez que vos épaules sont bien au-dessus des poignets avant de repartir',
      'Si vous ne pouvez pas toucher le sol jambes tendues, fléchissez légèrement les genoux — la souplesse viendra avec la pratique',
    ],
    commonMistakes: [
      "Se précipiter et bâcler les transitions — chaque phase (marche des mains, planche, marche des pieds) mérite d'être contrôlée",
      "Plier excessivement les genoux en ramenant les pieds — l'objectif est de sentir l'étirement des ischio-jambiers",
      'Les hanches qui montent ou descendent en planche — maintenez un alignement tête-talons comme pour une planche statique',
      "Oublier de marquer la position de planche — ne faites pas qu'un aller-retour, stabilisez-vous une seconde en planche",
      'Les mains qui avancent trop loin devant les épaules — en planche, les poignets doivent être sous les épaules',
    ],
  },

  // ─── Mobilité & Échauffement ───────────────────────────────────
  {
    slug: 'etirements',
    name: 'Étirements',
    aliases: ['Stretching', 'Étirement', 'Torsion', 'Cobra', 'Savasana', 'Devil press'],
    category: 'mobility',
    muscles: ['Ischio-jambiers', 'Quadriceps', 'Pectoraux', 'Psoas', 'Triceps'],
    difficulty: 1,
    image: '/images/core.webp',
    shortDescription:
      "Les étirements statiques en fin de séance permettent de ramener les muscles à leur longueur de repos, d'améliorer la souplesse et de favoriser la récupération. Chaque position est maintenue 20 à 30 secondes en respirant calmement.",
    execution:
      "Adoptez chaque position d'étirement lentement, sans à-coups. Maintenez la posture 20 à 30 secondes en respirant profondément. Vous devez ressentir une tension modérée, jamais une douleur. Relâchez doucement et passez à l'étirement suivant. Pour les étirements unilatéraux, travaillez toujours les deux côtés en maintenant le même temps de chaque côté.",
    breathing:
      'Respirez lentement et profondément par le nez. À chaque expiration, relâchez un peu plus la tension musculaire pour gagner en amplitude. Ne bloquez jamais votre respiration.',
    benefits: [
      "Améliore la souplesse musculaire et l'amplitude articulaire",
      'Favorise la récupération en réduisant les tensions post-effort',
      "Diminue le risque de blessures en maintenant l'élasticité des tissus",
      'Réduit les courbatures et les raideurs musculaires du lendemain',
      'Moment de retour au calme qui aide à la transition vers le repos',
    ],
    variants: [
      {
        name: 'Étirement ischio-jambiers',
        description:
          "Jambe tendue posée devant vous sur un support bas ou au sol, penchez le buste en avant en gardant le dos droit jusqu'à sentir l'étirement à l'arrière de la cuisse. Maintenez 20 à 30 secondes de chaque côté.",
      },
      {
        name: 'Étirement pectoraux',
        description:
          "Bras tendu contre un mur ou un encadrement de porte à 90°, pivotez lentement le buste vers l'extérieur jusqu'à sentir l'étirement dans la poitrine et l'avant de l'épaule. Maintenez 20 à 30 secondes de chaque côté.",
      },
      {
        name: 'Étirement psoas',
        description:
          "En position de fente basse, genou arrière au sol, poussez les hanches vers l'avant jusqu'à sentir l'étirement à l'avant de la hanche arrière. Le buste reste droit. Maintenez 20 à 30 secondes de chaque côté.",
      },
      {
        name: 'Étirement quadriceps debout',
        description:
          "Debout sur une jambe, attrapez le pied de l'autre jambe derrière vous et tirez le talon vers la fesse en gardant les genoux serrés. Gardez le bassin neutre. Maintenez 20 à 30 secondes de chaque côté.",
      },
      {
        name: 'Étirement triceps',
        description:
          "Bras levé, pliez le coude pour amener la main derrière la tête entre les omoplates. Avec l'autre main, poussez doucement le coude vers le bas. Maintenez 20 à 30 secondes de chaque côté.",
      },
    ],
    tips: [
      'Étirez-vous toujours sur des muscles chauds — jamais à froid en début de séance',
      "Recherchez la sensation d'étirement, pas la douleur : si ça fait mal, relâchez",
      'Ne rebondissez jamais dans un étirement : maintenez la position de manière statique',
      'Respectez la symétrie : étirez toujours les deux côtés le même temps',
    ],
    commonMistakes: [
      "S'étirer à froid avant l'effort — les étirements statiques réduisent la performance s'ils sont faits avant l'entraînement",
      "Forcer l'amplitude au point de ressentir une douleur — un étirement doit être confortable, jamais douloureux",
      'Faire des à-coups ou rebondir dans la position — augmente le risque de micro-déchirures musculaires',
      "Tenir moins de 15 secondes — en dessous, l'étirement n'a pas le temps de produire un effet significatif",
      'Bloquer la respiration — empêche le relâchement musculaire et augmente la tension',
    ],
  },
  {
    slug: 'mobilite',
    name: 'Mobilité articulaire',
    aliases: ['Mobilité', 'Mobility', 'Chat-vache', "Posture de l'enfant", 'Pigeon allongé', 'Scorpion stretches', 'Squat to stand', 'Rotation thoracique'],
    category: 'mobility',
    muscles: ['Hanches', 'Colonne vertébrale', 'Épaules', 'Chevilles'],
    difficulty: 1,
    image: '/images/core.webp',
    shortDescription:
      "Les exercices de mobilité améliorent l'amplitude de mouvement des articulations et la qualité du mouvement. Ils préparent le corps à l'effort en échauffement et favorisent la récupération en fin de séance.",
    execution:
      "Effectuez chaque mouvement de mobilité lentement et de manière contrôlée, en explorant toute l'amplitude disponible sans forcer. Enchaînez les positions de manière fluide en respirant régulièrement. Le travail de mobilité n'est pas un effort intense : c'est un dialogue avec votre corps pour identifier et réduire les restrictions de mouvement.",
    breathing:
      "Respirez calmement et profondément. Utilisez l'expiration pour relâcher les tensions et gagner en amplitude. La respiration guide le rythme du mouvement.",
    benefits: [
      "Améliore l'amplitude articulaire et la qualité de mouvement",
      "Prévient les blessures en préparant les articulations à l'effort",
      'Réduit les raideurs liées à la sédentarité et à la position assise',
      'Favorise la récupération et réduit les douleurs post-entraînement',
      'Améliore la posture et la conscience corporelle au quotidien',
    ],
    variants: [
      {
        name: 'Cat-cow',
        description:
          'À quatre pattes, alternez lentement entre dos rond (chat : tête baissée, nombril rentré, dos vers le plafond) et dos creux (vache : tête levée, ventre vers le sol, poitrine ouverte). Mobilise toute la colonne vertébrale segment par segment.',
      },
      {
        name: "Child's pose",
        description:
          "À genoux, asseyez-vous sur les talons et tendez les bras devant vous, front au sol. Respirez profondément dans le bas du dos. Position de repos et d'étirement qui relâche les lombaires, les épaules et les hanches.",
      },
      {
        name: 'Deep squat hold',
        description:
          "Maintenez un squat profond (fesses près du sol), pieds à plat, coudes contre l'intérieur des genoux pour les pousser vers l'extérieur. Améliore la mobilité des hanches, des chevilles et du bas du dos. Maintenez 30 à 60 secondes.",
      },
      {
        name: 'Hip 90/90',
        description:
          "Assis au sol, une jambe pliée à 90° devant vous (rotation externe de hanche) et l'autre à 90° sur le côté (rotation interne). Pivotez pour alterner les côtés. Travaille la mobilité en rotation des hanches dans les deux directions.",
      },
      {
        name: 'Pigeon stretch',
        description:
          "En position de fente, amenez le tibia avant au sol devant vous (parallèle ou en diagonale) et allongez la jambe arrière. Penchez le buste vers l'avant pour intensifier l'étirement du fessier et du piriforme. Maintenez 30 secondes de chaque côté.",
      },
      {
        name: 'Scorpion stretch',
        description:
          'Allongé sur le ventre, bras écartés en croix. Amenez le pied droit vers la main gauche en tournant le bassin, puis alternez. Mobilise la colonne thoracique en rotation et étire les fléchisseurs de hanche.',
      },
      {
        name: "Child's pose",
        description:
          "À genoux, asseyez-vous sur les talons et penchez le buste vers l'avant, bras tendus devant vous, front au sol. Genoux serrés pour cibler le bas du dos, ou écartés pour ouvrir les hanches. Maintien passif de 30 à 60 secondes en respirant profondément. Posture de récupération fondamentale.",
      },
      {
        name: "World's greatest stretch",
        description:
          "En position de fente basse, posez la main intérieure au sol, puis effectuez une rotation du buste en levant l'autre bras vers le ciel. Combine fente, rotation thoracique et ouverture de hanche en un seul mouvement complet. Le roi des échauffements.",
      },
    ],
    tips: [
      'Pratiquez la mobilité quotidiennement, même quelques minutes suffisent pour maintenir les gains',
      'Respectez les limites de votre corps : la mobilité se construit progressivement, pas en forçant',
      'Associez la mobilité articulaire à une respiration profonde pour maximiser le relâchement',
      'Les exercices de mobilité sont parfaits au réveil pour "réveiller" les articulations après la nuit',
    ],
    commonMistakes: [
      "Aller trop vite — la mobilité demande de la lenteur pour être efficace. Prenez le temps d'explorer chaque position.",
      "Forcer l'amplitude au-delà de ce que le corps permet — respectez les limitations actuelles et progressez graduellement",
      'Négliger la respiration — une respiration superficielle empêche le relâchement musculaire nécessaire',
      "Ne travailler la mobilité qu'en cas de douleur — la prévention est bien plus efficace que la correction",
      'Confondre mobilité et étirement — la mobilité est un mouvement actif et contrôlé, pas un maintien passif',
    ],
  },
  {
    slug: 'echauffement',
    name: 'Échauffement dynamique',
    aliases: ['Échauffement', 'Warm-up', 'Arm circles', 'Respiration', 'Rotations', 'Marche', 'Course sur place', 'Cercles', 'Balancement', 'A-skips', 'Carioca', 'Lateral shuffles'],
    category: 'mobility',
    muscles: ['Corps entier'],
    difficulty: 1,
    image: '/images/cardio.webp',
    shortDescription:
      "Les exercices d'échauffement dynamique préparent le corps à l'effort en augmentant progressivement la température corporelle, la fréquence cardiaque et la lubrification articulaire. Indispensables avant chaque séance pour performer et prévenir les blessures.",
    execution:
      "Commencez par des mouvements lents et de faible amplitude, puis augmentez progressivement la vitesse et l'intensité. L'échauffement dure généralement 5 à 10 minutes. L'objectif est de sentir le corps monter en température et les articulations se \"déverrouiller\" — vous devez être légèrement essoufflé à la fin.",
    breathing:
      "Respirez naturellement en suivant le rythme des mouvements. La respiration s'accélère progressivement avec l'intensité. Gardez une respiration fluide et régulière.",
    benefits: [
      'Augmente la température corporelle et la vascularisation musculaire',
      'Prépare les articulations en stimulant la production de liquide synovial',
      'Réduit significativement le risque de blessures musculaires et articulaires',
      'Améliore la performance en activant les connexions neuromusculaires',
      "Crée une transition mentale entre le quotidien et l'entraînement",
    ],
    variants: [
      {
        name: 'Rotations articulaires',
        description:
          'Effectuez des cercles lents et contrôlés avec chaque articulation : cou, épaules, coudes, poignets, hanches, genoux et chevilles. Commencez petit et agrandissez progressivement les cercles. 10 rotations dans chaque sens par articulation.',
      },
      {
        name: 'Marche rapide sur place',
        description:
          "Marchez vigoureusement sur place en levant les genoux et en balançant les bras de manière coordonnée. Augmente progressivement la fréquence cardiaque sans impact. Parfait pour commencer l'échauffement avant des mouvements plus intenses.",
      },
      {
        name: 'Toe taps (marche)',
        description:
          "Face à une marche ou un step bas, tapez alternativement la pointe de chaque pied sur le bord. Le rythme est rapide et régulier, comme un petit pas de course. Travaille la coordination, l'agilité et échauffe les mollets et les fléchisseurs de hanche.",
      },
      {
        name: 'Respiration profonde',
        description:
          'Inspirez lentement par le nez pendant 4 secondes en gonflant le ventre, retenez 4 secondes, puis expirez par la bouche pendant 6 secondes. Utilisé en fin de séance pour ramener le système nerveux au calme et accélérer la récupération. 5 à 10 cycles suffisent.',
      },
    ],
    tips: [
      "Ne sautez jamais l'échauffement — même 3 minutes valent mieux que rien",
      "Adaptez l'intensité : l'échauffement prépare à l'effort, il ne doit pas vous fatiguer",
      'Ciblez les zones qui seront le plus sollicitées dans la séance à venir',
      "En hiver ou par temps froid, allongez la durée de l'échauffement",
    ],
    commonMistakes: [
      'Sauter directement aux exercices intenses — le corps a besoin de 5 minutes minimum pour se préparer',
      "Faire des étirements statiques en guise d'échauffement — l'échauffement doit être dynamique et actif",
      "Aller trop vite et trop fort — l'échauffement est progressif, pas un sprint",
      'Se contenter de quelques mouvements de bras — tout le corps doit être échauffé, des chevilles aux épaules',
      "Considérer l'échauffement comme du temps perdu — c'est un investissement pour la performance et la prévention des blessures",
    ],
  },
];

export function getExerciseBySlug(slug: string): ExerciseData | undefined {
  return EXERCISES_DATA.find((e) => e.slug === slug);
}
