import type { Session } from '../../types/session.ts';

/** Semaine 1 — Programme Cardio Express (3 séances) */
export const cardioExpressSessions: Session[] = [
  {
    date: '',
    title: 'HIIT Brûle-Graisses',
    description: 'Intervalles haute intensité pour un maximum de dépense en minimum de temps',
    estimatedDuration: 22,
    focus: ['cardio', 'HIIT'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement express',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 35,
            instructions: 'Écarter bras et jambes en rythme, monter en intensité',
          },
          {
            name: 'High knees',
            duration: 30,
            instructions: 'Monter les genoux le plus haut possible en courant sur place',
          },
          { name: 'Fentes dynamiques', duration: 30, instructions: 'Alterner les fentes en marchant, grands pas' },
        ],
      },
      {
        type: 'hiit',
        name: 'HIIT 30/30',
        rounds: 8,
        work: 30,
        rest: 30,
        exercises: [
          { name: 'Burpees', instructions: 'Planche, pompe, saut explosif — intensité maximale' },
          { name: 'Squats sautés', instructions: 'Descendre en squat, exploser vers le haut, bras au ciel' },
          { name: 'Mountain climbers', instructions: 'En planche, genoux vers la poitrine le plus vite possible' },
          { name: 'Jumping lunges', instructions: 'Fentes alternées en sautant, rester gainé' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Marche sur place', duration: 40, instructions: 'Ralentir le rythme cardiaque progressivement' },
          {
            name: 'Étirement quadriceps',
            duration: 25,
            instructions: 'Debout, attraper le pied derrière soi',
            bilateral: true,
          },
          {
            name: 'Respiration profonde',
            duration: 30,
            instructions: 'Inspirer 4s par le nez, expirer 6s par la bouche',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Tabata Explosif',
    description: '20 secondes à fond, 10 secondes de repos — le format le plus court et intense',
    estimatedDuration: 20,
    focus: ['cardio', 'Tabata'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          {
            name: 'Skipping léger',
            duration: 35,
            instructions: 'Courir sur place en levant les genoux, bras en opposition',
          },
          {
            name: 'Arm circles rapides',
            duration: 25,
            instructions: 'Petits cercles rapides des bras, avant puis arrière',
          },
          {
            name: 'Squats dynamiques',
            duration: 30,
            instructions: 'Squats rapides pour monter la fréquence cardiaque',
          },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Set 1',
        sets: 2,
        rounds: 8,
        work: 20,
        rest: 10,
        restBetweenSets: 60,
        exercises: [
          { name: 'Speed squats', instructions: 'Squats rapides et explosifs, toucher le sol en bas' },
          { name: 'Push-up burpees', instructions: 'Planche, pompe, remonter en explosant — tout donner' },
          { name: 'Skaters', instructions: "Sauts latéraux d'un pied à l'autre, toucher le sol" },
          { name: 'Tuck jumps', instructions: 'Sauter en ramenant les genoux vers la poitrine' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Marche très lente',
            duration: 45,
            instructions: 'Marcher doucement, baisser la fréquence cardiaque',
          },
          {
            name: 'Étirement mollets',
            duration: 25,
            instructions: 'Un pied en avant, pousser le talon arrière dans le sol',
            bilateral: true,
          },
          {
            name: "Posture de l'enfant",
            duration: 35,
            instructions: 'Genoux au sol, bras tendus, relâcher complètement',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Circuit Cardio Intense',
    description: "Enchaînement rapide d'exercices pour repousser ses limites",
    estimatedDuration: 25,
    focus: ['cardio', 'circuit'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          {
            name: 'Montées de genoux',
            duration: 30,
            instructions: 'Genoux hauts, bras en opposition, accélérer progressivement',
          },
          { name: 'Butt kicks', duration: 30, instructions: 'Talons aux fessiers en courant sur place' },
          {
            name: 'Rotations du buste',
            duration: 25,
            instructions: 'Pieds fixes, tourner le torse dynamiquement de chaque côté',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Express',
        rounds: 4,
        restBetweenExercises: 10,
        restBetweenRounds: 40,
        exercises: [
          {
            name: 'Burpees complets',
            mode: 'reps' as const,
            reps: 8,
            instructions: 'Planche, pompe, saut explosif avec clap au-dessus de la tête',
          },
          {
            name: 'Plank jacks',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'En planche, écarter et resserrer les pieds en sautant',
          },
          {
            name: 'Squats sautés 180°',
            mode: 'reps' as const,
            reps: 8,
            instructions: "Squat, saut avec demi-tour, squat de l'autre côté",
          },
          {
            name: 'High knees',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Genoux le plus haut possible, rythme maximal',
          },
          {
            name: 'Pompes explosives',
            mode: 'reps' as const,
            reps: 6,
            instructions: 'Pompe avec poussée explosive, mains décollent du sol',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Marche lente', duration: 40, instructions: 'Ralentir progressivement, grandes respirations' },
          {
            name: 'Étirement psoas',
            duration: 30,
            instructions: "Fente basse, pousser la hanche vers l'avant",
            bilateral: true,
          },
          { name: 'Respiration 4-7-8', duration: 35, instructions: 'Inspirer 4s, retenir 7s, expirer 8s — 3 cycles' },
        ],
      },
    ],
  },
];
