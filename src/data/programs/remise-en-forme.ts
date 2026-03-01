import type { Session } from '../../types/session.ts';

/** Programme Remise en forme — 4 semaines × 4 séances = 16 séances */
export const remiseEnFormeSessions: Session[] = [
  // --- Semaine 1 ---
  {
    date: '',
    title: 'Haut du corps',
    description: 'Renforcement push/pull pour épaules, poitrine et dos',
    estimatedDuration: 30,
    focus: ['haut du corps', 'renforcement'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Arm circles',
            duration: 30,
            instructions: "Grands cercles de bras vers l'avant puis vers l'arrière",
          },
          { name: 'Inchworms', duration: 40, instructions: 'Debout, marcher les mains en planche, revenir debout' },
          {
            name: 'Pompes contre mur',
            duration: 30,
            instructions: 'Mains au mur, pompes lentes pour échauffer les épaules',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Push & Pull',
        restBetweenExercises: 45,
        exercises: [
          {
            name: 'Pompes classiques',
            sets: 3,
            reps: 10,
            restBetweenSets: 30,
            instructions: 'Mains largeur épaules, corps gainé, descendre la poitrine au sol',
          },
          {
            name: 'Pike push-ups',
            sets: 3,
            reps: 8,
            restBetweenSets: 30,
            instructions: 'Position V inversé, plier les coudes pour amener la tête vers le sol',
          },
          {
            name: 'Superman Y',
            sets: 3,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Allongé sur le ventre, lever les bras en Y et les jambes, tenir 2s',
          },
          {
            name: 'Pompes diamant',
            sets: 2,
            reps: 8,
            restBetweenSets: 30,
            instructions: 'Mains en losange sous la poitrine, coudes le long du corps',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements haut du corps',
        exercises: [
          {
            name: 'Étirement pectoraux',
            duration: 30,
            instructions: 'Bras tendu contre un mur, tourner le buste',
            bilateral: true,
          },
          {
            name: 'Étirement triceps',
            duration: 25,
            instructions: 'Bras au-dessus de la tête, plier le coude derrière la nuque',
            bilateral: true,
          },
          {
            name: 'Étirement épaules',
            duration: 25,
            instructions: "Bras tendu devant la poitrine, tirer avec l'autre main",
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio Circuit',
    description: 'Circuit complet pour relancer le cardio et brûler des calories',
    estimatedDuration: 30,
    focus: ['cardio', 'full-body'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          {
            name: 'Jumping jacks légers',
            duration: 35,
            instructions: 'Écarter bras et jambes en sautant, rythme modéré',
          },
          { name: 'Montées de genoux', duration: 30, instructions: 'Genoux à hauteur des hanches, bras en opposition' },
          {
            name: 'Fentes avant dynamiques',
            duration: 35,
            instructions: 'Alterner les fentes en avançant, grands pas',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Full-Body Cardio',
        rounds: 4,
        restBetweenExercises: 10,
        restBetweenRounds: 45,
        exercises: [
          {
            name: 'Burpees sans saut',
            mode: 'reps' as const,
            reps: 6,
            instructions: 'Planche, pompe, remonter debout — sans le saut',
          },
          {
            name: 'Squats sautés',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Squat explosif avec saut, amortir à la réception',
          },
          {
            name: 'Mountain climbers',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'En planche, ramener les genoux vers la poitrine en alternance',
          },
          {
            name: 'Fentes sautées',
            mode: 'timed' as const,
            duration: 20,
            instructions: 'Alterner les fentes en sautant, rester gainé',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Marche sur place', duration: 40, instructions: 'Ralentir progressivement, respirer profondément' },
          {
            name: 'Étirement quadriceps',
            duration: 25,
            instructions: 'Debout, attraper le pied derrière soi',
            bilateral: true,
          },
          {
            name: "Child's pose",
            duration: 35,
            instructions: 'Genoux au sol, bras tendus devant, relâcher le dos',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Bas du corps & Core',
    description: 'Cuisses, fessiers et abdominaux pour une base solide',
    estimatedDuration: 30,
    focus: ['bas du corps', 'core'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Cercles de hanches',
            duration: 30,
            instructions: 'Grands cercles dans les deux sens, mains sur les hanches',
          },
          {
            name: 'Good mornings',
            duration: 35,
            instructions: 'Pieds largeur épaules, mains derrière la tête, pencher le buste en gardant le dos droit',
          },
          { name: 'Squats légers', duration: 30, instructions: 'Squats lents sans charge pour échauffer les genoux' },
        ],
      },
      {
        type: 'superset',
        name: 'Jambes & Core',
        sets: 3,
        restBetweenSets: 45,
        restBetweenPairs: 30,
        pairs: [
          {
            exercises: [
              {
                name: 'Squats sumo',
                reps: 12,
                instructions: "Pieds écartés, pointes vers l'extérieur, descendre en gardant le dos droit",
              },
              { name: 'Crunchs', reps: 15, instructions: 'Allongé, mains aux tempes, soulever les épaules du sol' },
            ],
          },
          {
            exercises: [
              {
                name: 'Fentes bulgares',
                reps: 10,
                instructions: 'Pied arrière sur une chaise, descendre le genou arrière vers le sol',
              },
              { name: 'Planche', reps: 1, instructions: 'Sur les avant-bras, corps aligné, tenir 30 secondes' },
            ],
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Pigeon stretch',
            duration: 35,
            instructions: "Une jambe croisée devant, l'autre tendue derrière, pencher le buste",
            bilateral: true,
          },
          {
            name: 'Torsion allongée',
            duration: 30,
            instructions: "Allongé, un genou vers la poitrine puis le laisser tomber de l'autre côté",
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'EMOM Endurance',
    description: "Travail à la minute pour construire l'endurance musculaire",
    estimatedDuration: 28,
    focus: ['endurance', 'full-body'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 35,
            instructions: 'Écarter bras et jambes en rythme, rester léger sur les pieds',
          },
          { name: 'Inchworms', duration: 40, instructions: 'Marcher les mains en planche, faire une pompe, revenir' },
          { name: 'Squats dynamiques', duration: 30, instructions: 'Descendre et remonter rapidement, 10 répétitions' },
        ],
      },
      {
        type: 'emom',
        name: 'EMOM 12 minutes',
        minutes: 12,
        exercises: [
          { name: 'Pompes', reps: 8, instructions: 'Pompes classiques, rythme régulier' },
          { name: 'Squats sautés', reps: 10, instructions: 'Exploser vers le haut, amortir en douceur' },
          {
            name: 'Mountain climbers',
            reps: 12,
            instructions: 'En planche, ramener les genoux rapidement en alternance',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Respiration 4-7-8', duration: 40, instructions: 'Inspirer 4s, bloquer 7s, expirer 8s — 3 cycles' },
          {
            name: 'Étirement ischio-jambiers',
            duration: 30,
            instructions: "Assis, jambes tendues, pencher le buste vers l'avant",
          },
          {
            name: "Child's pose",
            duration: 35,
            instructions: 'Genoux au sol, bras tendus, relâcher tout le dos',
          },
        ],
      },
    ],
  },

  // --- Semaine 2 ---
  {
    date: '',
    title: 'Haut du corps — Force',
    description: 'Renforcement progressif avec supersets push/pull et volume accru',
    estimatedDuration: 32,
    focus: ['haut du corps', 'renforcement'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Arm circles progressifs',
            duration: 30,
            instructions: 'Petits cercles puis grands cercles, accélérer progressivement',
          },
          {
            name: 'Pompes inclinées',
            duration: 35,
            instructions: 'Mains sur une chaise, pompes lentes pour activer les pectoraux',
          },
          {
            name: 'Scapular push-ups',
            duration: 30,
            instructions: 'En planche, bras tendus, rapprocher et écarter les omoplates sans plier les coudes',
          },
        ],
      },
      {
        type: 'superset',
        name: 'Push & Pull supersets',
        sets: 3,
        restBetweenSets: 40,
        restBetweenPairs: 25,
        pairs: [
          {
            exercises: [
              {
                name: 'Pompes classiques',
                reps: 12,
                instructions: 'Mains largeur épaules, descendre la poitrine au sol, rythme contrôlé',
              },
              {
                name: 'Superman W',
                reps: 12,
                instructions: 'Allongé sur le ventre, lever le buste et tirer les coudes en W, tenir 2s',
              },
            ],
          },
          {
            exercises: [
              {
                name: 'Pike push-ups',
                reps: 10,
                instructions: 'Position V inversé, plier les coudes, contrôler la descente',
              },
              {
                name: 'Reverse snow angels',
                reps: 10,
                instructions:
                  'Allongé sur le ventre, bras le long du corps, les lever en arc de cercle au-dessus de la tête',
              },
            ],
          },
        ],
      },
      {
        type: 'classic',
        name: 'Finition triceps',
        restBetweenExercises: 30,
        exercises: [
          {
            name: 'Pompes diamant',
            sets: 3,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Mains en losange, coudes serrés, contrôler la descente',
          },
          {
            name: 'Dips sur chaise',
            sets: 3,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Mains sur le bord de la chaise, descendre les fesses, coudes à 90 degrés',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements haut du corps',
        exercises: [
          {
            name: 'Étirement pectoraux au sol',
            duration: 30,
            instructions: 'Allongé sur le ventre, un bras tendu à 90 degrés, rouler doucement',
            bilateral: true,
          },
          {
            name: 'Étirement dorsaux',
            duration: 25,
            instructions: 'À genoux, bras tendus devant, pousser les hanches en arrière',
          },
          {
            name: 'Étirement triceps',
            duration: 25,
            instructions: 'Bras au-dessus de la tête, plier le coude derrière la nuque',
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio HIIT',
    description: 'Intervalles haute intensité pour augmenter la capacité cardio',
    estimatedDuration: 30,
    focus: ['cardio', 'hiit'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 40,
            instructions: 'Rythme progressif, commencer lentement puis accélérer',
          },
          {
            name: 'High knees',
            duration: 30,
            instructions: 'Monter les genoux au-dessus des hanches, bras en opposition',
          },
          {
            name: 'Fentes latérales dynamiques',
            duration: 35,
            instructions: 'Alterner gauche-droite, pousser les hanches en arrière',
          },
        ],
      },
      {
        type: 'hiit',
        name: 'HIIT Full-Body',
        rounds: 4,
        work: 30,
        rest: 15,
        exercises: [
          {
            name: 'Burpees complets',
            instructions: 'Planche, pompe, saut explosif avec bras au-dessus de la tête',
          },
          {
            name: 'Speed squats',
            instructions: 'Squats rapides et profonds, rester explosif à la remontée',
          },
          {
            name: 'Planche commando',
            instructions: 'Alterner planche sur avant-bras et planche bras tendus',
          },
          {
            name: 'Tuck jumps',
            instructions: "Sauter et ramener les genoux vers la poitrine en l'air",
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche sur place',
            duration: 45,
            instructions: 'Ralentir le rythme cardiaque progressivement',
          },
          {
            name: 'Étirement fléchisseurs de hanche',
            duration: 30,
            instructions: "Genou arrière au sol, hanche poussée vers l'avant",
            bilateral: true,
          },
          {
            name: 'Respiration diaphragmatique',
            duration: 40,
            instructions: 'Allongé, mains sur le ventre, inspirer par le nez 4s, expirer 6s',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Bas du corps & Core — Volume',
    description: 'Montée en volume sur les jambes avec travail abdominal renforcé',
    estimatedDuration: 32,
    focus: ['bas du corps', 'core'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Cercles de chevilles',
            duration: 25,
            instructions: 'Pointe du pied au sol, dessiner des cercles dans les deux sens',
          },
          {
            name: 'Good mornings',
            duration: 35,
            instructions: 'Mains derrière la tête, pencher le buste en gardant le dos plat',
          },
          {
            name: 'Squats avec pause',
            duration: 35,
            instructions: 'Descendre en squat, tenir 3 secondes en bas, remonter',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Jambes — Volume',
        restBetweenExercises: 40,
        exercises: [
          {
            name: 'Squats sumo',
            sets: 3,
            reps: 14,
            restBetweenSets: 30,
            instructions: "Pieds écartés, pointes vers l'extérieur, descendre lentement sur 3 secondes",
          },
          {
            name: 'Fentes bulgares',
            sets: 3,
            reps: 12,
            restBetweenSets: 30,
            instructions: "Pied arrière sur une chaise, descendre jusqu'à ce que le genou frôle le sol",
            bilateral: true,
          },
          {
            name: 'Hip thrust unilatéral',
            sets: 3,
            reps: 10,
            restBetweenSets: 25,
            instructions: "Une jambe tendue en l'air, soulever les hanches en serrant le fessier",
            bilateral: true,
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Core intensif',
        rounds: 3,
        restBetweenExercises: 10,
        restBetweenRounds: 40,
        exercises: [
          {
            name: 'Bicycle crunchs',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Coude vers genou opposé en alternance, rythme soutenu',
          },
          {
            name: 'Planche',
            mode: 'timed' as const,
            duration: 35,
            instructions: 'Avant-bras au sol, corps aligné tête-pieds, respirer normalement',
          },
          {
            name: 'Russian twists',
            mode: 'reps' as const,
            reps: 20,
            instructions: 'Assis, pieds décollés du sol, tourner le buste à gauche et à droite',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Pigeon stretch',
            duration: 35,
            instructions: "Une jambe croisée devant, l'autre tendue derrière, relâcher le buste",
            bilateral: true,
          },
          {
            name: 'Étirement quadriceps allongé',
            duration: 25,
            instructions: 'Allongé sur le côté, attraper le pied derrière soi',
            bilateral: true,
          },
          {
            name: 'Cobra',
            duration: 30,
            instructions: 'Allongé sur le ventre, pousser les mains pour étirer les abdominaux',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'EMOM Endurance +',
    description: 'EMOM allongé avec plus de répétitions et exercices variés',
    estimatedDuration: 30,
    focus: ['endurance', 'full-body'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 40,
            instructions: 'Rythme progressif pour monter le cardio',
          },
          {
            name: 'Inchworms avec pompe',
            duration: 40,
            instructions: 'Marcher les mains en planche, une pompe, revenir debout',
          },
          {
            name: 'Fentes dynamiques',
            duration: 35,
            instructions: 'Alterner les fentes en avançant, grands pas dynamiques',
          },
        ],
      },
      {
        type: 'emom',
        name: 'EMOM 15 minutes',
        minutes: 15,
        exercises: [
          {
            name: 'Pompes',
            reps: 10,
            instructions: 'Pompes classiques, tempo régulier, descendre la poitrine au sol',
          },
          {
            name: 'Squats sautés',
            reps: 12,
            instructions: "Exploser vers le haut, réception souple sur l'avant du pied",
          },
          {
            name: 'Mountain climbers',
            reps: 14,
            instructions: 'En planche, genoux vers la poitrine, rythme rapide',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Respiration 4-7-8',
            duration: 45,
            instructions: 'Inspirer 4s, bloquer 7s, expirer 8s — 4 cycles',
          },
          {
            name: 'Étirement ischio-jambiers',
            duration: 30,
            instructions: "Assis, jambes tendues, pencher le buste doucement vers l'avant",
          },
          {
            name: "Child's pose",
            duration: 40,
            instructions: 'Genoux au sol, bras tendus, front au sol, relâcher complètement',
          },
        ],
      },
    ],
  },

  // --- Semaine 3 ---
  {
    date: '',
    title: 'Haut du corps — Puissance',
    description: 'Exercices avancés et mouvements explosifs pour le haut du corps',
    estimatedDuration: 33,
    focus: ['haut du corps', 'puissance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Arm circles dynamiques',
            duration: 30,
            instructions: 'Cercles rapides petits puis grands, inverser après 15 secondes',
          },
          {
            name: 'Pompes lentes',
            duration: 40,
            instructions: '5 pompes avec descente sur 3 secondes pour activer les pectoraux',
          },
          {
            name: 'Bear crawl sur place',
            duration: 30,
            instructions: 'Position quadrupédie genoux décollés, avancer/reculer les mains sur place',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Push explosif',
        restBetweenExercises: 40,
        exercises: [
          {
            name: 'Pompes claquées (genoux)',
            sets: 3,
            reps: 8,
            restBetweenSets: 30,
            instructions: 'Genoux au sol, pousser explosivement pour décoller les mains, claquer',
          },
          {
            name: 'Pike push-ups pieds surélevés',
            sets: 3,
            reps: 10,
            restBetweenSets: 30,
            instructions: 'Pieds sur une chaise, position V, plier les coudes vers le sol',
          },
          {
            name: 'Pompes archer',
            sets: 3,
            reps: 6,
            restBetweenSets: 30,
            instructions: "Un bras fait la pompe, l'autre est tendu sur le côté — alterner",
            bilateral: true,
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Pull & Core',
        rounds: 3,
        restBetweenExercises: 10,
        restBetweenRounds: 40,
        exercises: [
          {
            name: 'Superman nageur',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Allongé sur le ventre, mouvement de crawl avec bras et jambes décollés',
          },
          {
            name: 'Planche commando',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Alterner avant-bras et bras tendus sans bouger les hanches',
          },
          {
            name: 'Pompes diamant',
            mode: 'reps' as const,
            reps: 10,
            instructions: 'Mains en losange, coudes serrés le long du corps',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements haut du corps',
        exercises: [
          {
            name: 'Étirement pectoraux au sol',
            duration: 30,
            instructions: "Allongé sur le ventre, bras en T, rouler doucement d'un côté",
            bilateral: true,
          },
          {
            name: 'Étirement dorsaux en torsion',
            duration: 25,
            instructions: 'Assis, croiser une jambe, tourner le buste vers le genou',
            bilateral: true,
          },
          {
            name: 'Étirement épaules derrière le dos',
            duration: 25,
            instructions: 'Bras derrière le dos, attraper les mains, ouvrir la poitrine',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio Tabata',
    description: 'Tabata haute intensité pour repousser les limites cardiovasculaires',
    estimatedDuration: 30,
    focus: ['cardio', 'tabata'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          {
            name: 'High knees progressifs',
            duration: 40,
            instructions: 'Commencer lentement, accélérer toutes les 10 secondes',
          },
          {
            name: 'Fentes multiplanaires',
            duration: 35,
            instructions: 'Fente avant, fente latérale, fente arrière — alterner',
            bilateral: true,
          },
          {
            name: 'Burpees lents',
            duration: 30,
            instructions: '4 burpees contrôlés pour échauffer tout le corps',
          },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Full-Body',
        sets: 2,
        rounds: 4,
        work: 20,
        rest: 10,
        restBetweenSets: 60,
        exercises: [
          {
            name: 'Burpees complets',
            instructions: 'Planche, pompe, saut explosif, bras au-dessus de la tête',
          },
          {
            name: 'Fentes sautées',
            instructions: 'Alterner les jambes en sautant, genou arrière frôle le sol',
          },
          {
            name: 'Mountain climbers croisés',
            instructions: 'Genou droit vers coude gauche et inversement, rythme maximal',
          },
          {
            name: 'Squats sautés 180',
            instructions: "Squat sauté avec demi-tour en l'air, alterner le sens",
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche lente',
            duration: 45,
            instructions: 'Marcher doucement, laisser le rythme cardiaque descendre',
          },
          {
            name: 'Étirement fléchisseurs de hanche',
            duration: 30,
            instructions: "Genou au sol, pousser la hanche avant vers l'avant",
            bilateral: true,
          },
          {
            name: "Child's pose",
            duration: 40,
            instructions: 'Genoux au sol, front au sol, bras tendus devant, respirer profondément',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Bas du corps & Core — Explosif',
    description: 'Mouvements explosifs et gainage avancé pour jambes et abdominaux',
    estimatedDuration: 33,
    focus: ['bas du corps', 'core', 'explosivité'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Balancement de jambes',
            duration: 30,
            instructions: 'Avant-arrière puis latéral, 10 balancements par jambe',
            bilateral: true,
          },
          {
            name: 'Squats avec rotation',
            duration: 35,
            instructions: 'Squat, en remontant tourner le buste avec bras tendu vers le ciel',
          },
          {
            name: 'Fentes avant avec bascule du buste',
            duration: 30,
            instructions: 'Fente avant, pencher le buste vers le genou pour étirer le fessier',
          },
        ],
      },
      {
        type: 'superset',
        name: 'Puissance Jambes',
        sets: 4,
        restBetweenSets: 40,
        restBetweenPairs: 25,
        pairs: [
          {
            exercises: [
              {
                name: 'Squats sautés',
                reps: 12,
                instructions: 'Squat profond puis saut explosif, amortir en douceur',
              },
              {
                name: 'V-ups',
                reps: 12,
                instructions: 'Allongé, lever jambes et buste simultanément pour toucher les pieds',
              },
            ],
          },
          {
            exercises: [
              {
                name: 'Fentes sautées',
                reps: 10,
                instructions: "Alterner les jambes en sautant, rester gainé à l'atterrissage",
              },
              {
                name: 'Gainage latéral',
                reps: 1,
                instructions: 'Avant-bras au sol, hanches hautes, tenir 25 secondes par côté',
              },
            ],
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Finition Core',
        rounds: 3,
        restBetweenExercises: 10,
        restBetweenRounds: 35,
        exercises: [
          {
            name: 'Bicycle crunchs',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Coude vers genou opposé, jambe libre tendue, rythme soutenu',
          },
          {
            name: 'Dead bug',
            mode: 'reps' as const,
            reps: 12,
            instructions: "Allongé, bras et jambes en l'air, étendre un bras et la jambe opposée",
          },
          {
            name: "Planche avec toucher d'épaule",
            mode: 'reps' as const,
            reps: 16,
            instructions: "En planche bras tendus, toucher l'épaule opposée sans bouger les hanches",
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Pigeon stretch',
            duration: 35,
            instructions: 'Jambe avant croisée, buste penché, respirer profondément',
            bilateral: true,
          },
          {
            name: 'Torsion allongée',
            duration: 30,
            instructions: 'Allongé, croiser un genou vers le côté opposé, bras en T',
            bilateral: true,
          },
          {
            name: 'Cobra',
            duration: 30,
            instructions: 'Allongé sur le ventre, pousser sur les mains pour étirer les abdominaux',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'EMOM Endurance Avancé',
    description: 'EMOM avec exercices composés et tempo élevé',
    estimatedDuration: 32,
    focus: ['endurance', 'full-body'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Jumping jacks rapides',
            duration: 40,
            instructions: 'Rythme soutenu dès le départ pour préparer le cardio',
          },
          {
            name: 'Bear crawl',
            duration: 35,
            instructions: 'Position quadrupédie genoux décollés, avancer sur 2 mètres et reculer',
          },
          {
            name: 'Squats sautés légers',
            duration: 30,
            instructions: "Petits sauts contrôlés, focus sur l'amortissement",
          },
        ],
      },
      {
        type: 'emom',
        name: 'EMOM 16 minutes',
        minutes: 16,
        exercises: [
          {
            name: 'Burpees',
            reps: 6,
            instructions: 'Burpee complet avec pompe et saut, mouvement fluide',
          },
          {
            name: 'Pike push-ups',
            reps: 10,
            instructions: 'Position V inversé, coudes fléchis, tête vers le sol',
          },
          {
            name: 'Squats sautés',
            reps: 12,
            instructions: 'Squat profond, saut explosif, réception amortie',
          },
          {
            name: 'Planche commando',
            reps: 10,
            instructions: 'Alterner avant-bras et bras tendus, compter chaque cycle comme 1 rep',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Respiration 4-7-8',
            duration: 45,
            instructions: 'Inspirer 4s, bloquer 7s, expirer 8s — 4 cycles complets',
          },
          {
            name: 'Étirement ischio-jambiers debout',
            duration: 30,
            instructions: "Jambe tendue sur un support, pencher le buste vers l'avant",
            bilateral: true,
          },
          {
            name: "Child's pose",
            duration: 40,
            instructions: 'Genoux au sol, bras tendus devant, relâcher le dos et la nuque',
          },
        ],
      },
    ],
  },

  // --- Semaine 4 ---
  {
    date: '',
    title: 'Haut du corps — Max Effort',
    description: 'Séance intense combinant volume, explosivité et finition en circuit',
    estimatedDuration: 35,
    focus: ['haut du corps', 'puissance', 'endurance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Inchworms avec pompe',
            duration: 40,
            instructions: 'Marcher les mains en planche, pompe, revenir debout — 5 répétitions',
          },
          {
            name: 'Scapular push-ups',
            duration: 30,
            instructions: 'En planche bras tendus, rapprocher les omoplates puis les écarter',
          },
          {
            name: 'Bear crawl',
            duration: 30,
            instructions: 'Avancer 3 pas en quadrupédie genoux décollés, reculer 3 pas',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Push Max',
        restBetweenExercises: 35,
        exercises: [
          {
            name: 'Pompes claquées',
            sets: 4,
            reps: 8,
            restBetweenSets: 25,
            instructions: 'Pousser explosivement pour décoller les mains du sol, claquer, amortir',
          },
          {
            name: 'Pike push-ups pieds surélevés',
            sets: 4,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Pieds sur une chaise, position V, contrôler la descente sur 2 secondes',
          },
          {
            name: 'Pompes archer',
            sets: 4,
            reps: 8,
            restBetweenSets: 25,
            instructions: "Un bras fait la pompe, l'autre est tendu, alterner chaque rep",
            bilateral: true,
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Finition totale',
        rounds: 4,
        restBetweenExercises: 10,
        restBetweenRounds: 35,
        exercises: [
          {
            name: 'Pompes diamant',
            mode: 'reps' as const,
            reps: 10,
            instructions: 'Mains en losange, coudes serrés, descendre la poitrine au sol',
          },
          {
            name: 'Dips sur chaise',
            mode: 'reps' as const,
            reps: 12,
            instructions: 'Mains sur la chaise, descendre les fesses, coudes à 90 degrés',
          },
          {
            name: 'Superman nageur',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Allongé sur le ventre, mouvement de nage bras et jambes décollés',
          },
          {
            name: 'Planche commando',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Alterner avant-bras et bras tendus sans rotation des hanches',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements profonds',
        exercises: [
          {
            name: 'Étirement pectoraux au sol',
            duration: 35,
            instructions: 'Allongé face au sol, bras en T, rouler doucement sur un côté',
            bilateral: true,
          },
          {
            name: 'Étirement dorsaux',
            duration: 30,
            instructions: 'À genoux, bras tendus devant au sol, pousser les hanches en arrière',
          },
          {
            name: 'Étirement cou et trapèzes',
            duration: 25,
            instructions: "Incliner la tête d'un côté, main sur la tempe pour guider doucement",
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio Extreme',
    description: 'HIIT maximal avec enchaînements composés et récupérations courtes',
    estimatedDuration: 32,
    focus: ['cardio', 'hiit', 'full-body'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement haute intensité',
        exercises: [
          {
            name: 'High knees rapides',
            duration: 40,
            instructions: 'Genoux au-dessus des hanches, bras en opposition, rythme élevé',
          },
          {
            name: 'Burpees contrôlés',
            duration: 35,
            instructions: '5 burpees avec pompe, rythme modéré pour échauffer',
          },
          {
            name: 'Fentes sautées légères',
            duration: 30,
            instructions: 'Petits sauts entre les fentes, échauffer les cuisses et chevilles',
          },
        ],
      },
      {
        type: 'hiit',
        name: 'HIIT Extreme',
        rounds: 5,
        work: 35,
        rest: 15,
        exercises: [
          {
            name: 'Burpees avec tuck jump',
            instructions: 'Burpee complet puis sauter en ramenant les genoux à la poitrine',
          },
          {
            name: 'Mountain climbers sprint',
            instructions: 'Rythme maximal, genoux vers la poitrine le plus vite possible',
          },
          {
            name: 'Squats sautés 180',
            instructions: "Squat sauté avec demi-tour en l'air, enchaîner sans pause",
          },
          {
            name: 'Planche saut écart',
            instructions: 'En planche, sauter pieds écartés puis serrés comme un jumping jack',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche très lente',
            duration: 50,
            instructions: 'Ralentir progressivement, expirer longuement à chaque pas',
          },
          {
            name: 'Étirement quadriceps',
            duration: 30,
            instructions: 'Debout, attraper le pied derrière soi, tirer doucement',
            bilateral: true,
          },
          {
            name: 'Respiration 4-7-8',
            duration: 45,
            instructions: 'Inspirer 4s, bloquer 7s, expirer 8s — 4 cycles pour le retour au calme',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Bas du corps & Core — Total',
    description: 'Séance combinée jambes et abdominaux avec volume et explosivité maximaux',
    estimatedDuration: 35,
    focus: ['bas du corps', 'core', 'puissance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Squats progressifs',
            duration: 35,
            instructions: '5 squats lents, 5 squats normaux, 5 squats rapides',
          },
          {
            name: 'Fentes multiplanaires',
            duration: 35,
            instructions: 'Fente avant, fente latérale, fente arrière — 3 de chaque par jambe',
          },
          {
            name: 'Dead bug lent',
            duration: 30,
            instructions: "Allongé, bras et jambes en l'air, étendre lentement bras et jambe opposés",
          },
        ],
      },
      {
        type: 'superset',
        name: 'Puissance Jambes Max',
        sets: 4,
        restBetweenSets: 35,
        restBetweenPairs: 20,
        pairs: [
          {
            exercises: [
              {
                name: 'Squats sautés avec pause',
                reps: 14,
                instructions: 'Descendre, pause 1 seconde en bas, exploser vers le haut',
              },
              {
                name: 'V-ups',
                reps: 15,
                instructions: 'Lever jambes et buste simultanément, toucher les pieds avec les mains',
              },
            ],
          },
          {
            exercises: [
              {
                name: 'Fentes sautées',
                reps: 14,
                instructions: 'Alterner en sautant, le genou arrière frôle le sol, rester gainé',
              },
              {
                name: 'Gainage latéral avec élévation de hanche',
                reps: 12,
                instructions: 'En planche latérale, descendre la hanche au sol puis remonter',
              },
            ],
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Abdos finition',
        rounds: 4,
        restBetweenExercises: 10,
        restBetweenRounds: 30,
        exercises: [
          {
            name: 'Bicycle crunchs rapides',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Coude vers genou opposé, rythme maximal, ne pas tirer la nuque',
          },
          {
            name: 'Mountain climbers lents',
            mode: 'reps' as const,
            reps: 16,
            instructions: 'Genou vers coude opposé, tenir 1 seconde, alterner — focus gainage',
          },
          {
            name: 'Planche avec toucher de pieds',
            mode: 'reps' as const,
            reps: 12,
            instructions: 'En planche bras tendus, amener la main au pied opposé en passant sous le corps',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements profonds',
        exercises: [
          {
            name: 'Pigeon stretch',
            duration: 40,
            instructions: 'Jambe avant croisée, buste posé au sol, respirer profondément',
            bilateral: true,
          },
          {
            name: 'Torsion allongée',
            duration: 35,
            instructions: "Allongé, les deux genoux d'un côté, bras en T, relâcher le dos",
            bilateral: true,
          },
          {
            name: 'Cobra',
            duration: 30,
            instructions: 'Pousser sur les mains, bras tendus, ouvrir la poitrine et étirer les abdos',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'EMOM Endurance Finale',
    description: 'EMOM ultime avec exercices composés pour clôturer le programme en force',
    estimatedDuration: 35,
    focus: ['endurance', 'full-body', 'puissance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Jumping jacks rapides',
            duration: 40,
            instructions: 'Rythme soutenu, bras tendus, rester léger sur les pieds',
          },
          {
            name: 'Inchworms avec pompe et rotation',
            duration: 40,
            instructions: 'Inchworm, pompe, rotation en T bras vers le ciel, revenir debout',
          },
          {
            name: 'Fentes sautées légères',
            duration: 30,
            instructions: 'Petits sauts entre les fentes pour activer les jambes',
          },
        ],
      },
      {
        type: 'emom',
        name: 'EMOM 20 minutes',
        minutes: 20,
        exercises: [
          {
            name: 'Burpees avec pompe',
            reps: 8,
            instructions: 'Burpee complet avec pompe et saut, mouvement fluide et contrôlé',
          },
          {
            name: 'Pike push-ups',
            reps: 12,
            instructions: 'Position V inversé, descente contrôlée, pousser explosif',
          },
          {
            name: 'Squats sautés',
            reps: 14,
            instructions: 'Squat profond, saut maximal, amortir en silence à la réception',
          },
          {
            name: 'Mountain climbers croisés',
            reps: 16,
            instructions: 'Genou vers coude opposé, rythme rapide, gainage maximal',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme final',
        exercises: [
          {
            name: 'Respiration 4-7-8',
            duration: 50,
            instructions: 'Inspirer 4s, bloquer 7s, expirer 8s — 5 cycles pour clôturer',
          },
          {
            name: 'Étirement ischio-jambiers',
            duration: 35,
            instructions: 'Assis, jambes tendues, pencher le buste vers les pieds, tenir la position',
          },
          {
            name: "Child's pose",
            duration: 45,
            instructions: 'Genoux écartés, bras loin devant, front au sol, relâcher complètement tout le corps',
          },
        ],
      },
    ],
  },
];
