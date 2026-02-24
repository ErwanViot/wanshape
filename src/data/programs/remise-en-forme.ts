import type { Session } from '../../types/session.ts';

/** Semaine 1 — Programme Remise en forme (4 séances) */
export const remiseEnFormeSessions: Session[] = [
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
            name: "Posture de l'enfant",
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
            name: 'Pigeon allongé',
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
            name: "Posture de l'enfant",
            duration: 35,
            instructions: 'Genoux au sol, bras tendus, relâcher tout le dos',
          },
        ],
      },
    ],
  },
];
