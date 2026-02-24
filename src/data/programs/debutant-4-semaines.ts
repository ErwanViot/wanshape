import type { Session } from '../../types/session.ts';

/** Semaine 1 — Programme Débutant 4 semaines (3 séances) */
export const debutant4SemainesSessions: Session[] = [
  {
    date: '',
    title: 'Découverte Full-Body',
    description: 'Premiers mouvements fondamentaux : squats, pompes adaptées et gainage',
    estimatedDuration: 25,
    focus: ['full-body', 'mobilité'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement doux',
        exercises: [
          { name: 'Rotations articulaires', duration: 45, instructions: 'Cou, épaules, poignets, hanches, chevilles — lents et contrôlés' },
          { name: 'Marche sur place', duration: 40, instructions: 'Lever les genoux progressivement, balancer les bras' },
          { name: 'Cercles de hanches', duration: 30, instructions: 'Mains sur les hanches, grands cercles dans les deux sens' },
        ],
      },
      {
        type: 'classic',
        name: 'Fondamentaux',
        restBetweenExercises: 45,
        exercises: [
          { name: 'Squats assistés', sets: 2, reps: 10, restBetweenSets: 30, instructions: 'Pieds largeur épaules, descendre comme pour s\'asseoir, mains devant pour l\'équilibre' },
          { name: 'Pompes sur genoux', sets: 2, reps: 8, restBetweenSets: 30, instructions: 'Mains largeur épaules, genoux au sol, descendre la poitrine vers le sol' },
          { name: 'Planche sur genoux', sets: 2, reps: 1, restBetweenSets: 30, tempo: '20s maintien', instructions: 'Avant-bras au sol, genoux au sol, corps aligné, tenir 20 secondes' },
          { name: 'Pont fessier', sets: 2, reps: 12, restBetweenSets: 30, instructions: 'Allongé sur le dos, pieds au sol, soulever les hanches en serrant les fessiers' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          { name: 'Étirement quadriceps', duration: 30, instructions: 'Debout, attraper le pied derrière soi, chaque jambe', bilateral: true },
          { name: 'Étirement ischio-jambiers', duration: 30, instructions: 'Assis, jambes tendues, pencher le buste vers l\'avant', bilateral: false },
          { name: 'Étirement pectoraux', duration: 25, instructions: 'Bras contre un mur, tourner le buste doucement', bilateral: true },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio Doux',
    description: 'Circuit léger pour activer le cardio sans surcharger les articulations',
    estimatedDuration: 25,
    focus: ['cardio', 'endurance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          { name: 'Marche rapide sur place', duration: 45, instructions: 'Accélérer progressivement, grands mouvements de bras' },
          { name: 'Talons-fesses légers', duration: 30, instructions: 'Sur place, ramener les talons vers les fessiers en douceur' },
          { name: 'Rotations du buste', duration: 30, instructions: 'Pieds fixes, tourner le haut du corps de gauche à droite' },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Cardio Débutant',
        rounds: 3,
        restBetweenExercises: 15,
        restBetweenRounds: 60,
        exercises: [
          { name: 'Pas chassés', mode: 'timed' as const, duration: 30, instructions: 'Pas latéraux dynamiques, rester bas sur les appuis' },
          { name: 'Montées de genoux', mode: 'timed' as const, duration: 25, instructions: 'Lever les genoux à hauteur des hanches, rythme modéré' },
          { name: 'Squats sumo', mode: 'reps' as const, reps: 10, instructions: 'Pieds écartés, pointes vers l\'extérieur, descendre lentement' },
          { name: 'Marche de l\'ours', mode: 'timed' as const, duration: 20, instructions: 'À quatre pattes, genoux décollés du sol, avancer/reculer' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Marche lente sur place', duration: 40, instructions: 'Ralentir progressivement, respirer profondément' },
          { name: 'Étirement mollets', duration: 25, instructions: 'Un pied en avant, pousser le talon arrière au sol', bilateral: true },
          { name: 'Respiration profonde', duration: 30, instructions: 'Inspirer 4s, bloquer 4s, expirer 4s — 3 cycles' },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Renforcement & Gainage',
    description: 'Focus core et posture avec des mouvements contrôlés et accessibles',
    estimatedDuration: 25,
    focus: ['core', 'posture'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          { name: 'Chat-vache', duration: 40, instructions: 'À quatre pattes, alterner dos rond et dos creux en respirant' },
          { name: 'Rotation thoracique', duration: 35, instructions: 'À quatre pattes, une main derrière la tête, ouvrir le coude vers le ciel', bilateral: true },
          { name: 'Balancement des bras', duration: 25, instructions: 'Debout, laisser les bras se balancer de gauche à droite' },
        ],
      },
      {
        type: 'classic',
        name: 'Core & Posture',
        restBetweenExercises: 40,
        exercises: [
          { name: 'Dead bug', sets: 2, reps: 8, restBetweenSets: 25, instructions: 'Allongé, bras tendus vers le plafond, étendre une jambe et le bras opposé', bilateral: true },
          { name: 'Superman', sets: 2, reps: 10, restBetweenSets: 25, instructions: 'Allongé sur le ventre, lever bras et jambes simultanément, tenir 2s' },
          { name: 'Planche latérale sur genoux', sets: 2, reps: 1, restBetweenSets: 20, tempo: '15s par côté', instructions: 'Sur le coude et le genou, corps aligné, tenir 15 secondes chaque côté', bilateral: true },
          { name: 'Fentes arrière', sets: 2, reps: 8, restBetweenSets: 30, instructions: 'Un grand pas en arrière, genou frôle le sol, remonter', bilateral: true },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          { name: 'Posture de l\'enfant', duration: 35, instructions: 'Genoux au sol, bras tendus devant, relâcher le dos' },
          { name: 'Torsion allongée', duration: 30, instructions: 'Allongé, ramener un genou vers la poitrine et le laisser tomber de l\'autre côté', bilateral: true },
          { name: 'Étirement psoas', duration: 25, instructions: 'Fente basse, pousser la hanche du genou au sol vers l\'avant', bilateral: true },
        ],
      },
    ],
  },
];
