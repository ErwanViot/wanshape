import type { Session } from '../../types/session.ts';

/** Programme Débutant 4 semaines — 12 séances (3 par semaine)
 *
 * Progression :
 *  - Semaine 1 : mouvements de base, 2 séries, repos généreux, variantes facilitées
 *  - Semaine 2 : mêmes patterns améliorés, 2-3 séries, reps en hausse, repos réduit
 *  - Semaine 3 : variantes complètes (planche pieds, pompes standard), 3 séries, EMOM introduit
 *  - Semaine 4 : circuits combinés, supersets, volume augmenté, repos courts
 */
export const debutant4SemainesSessions: Session[] = [
  // ──────────────────────────────────────────────
  // --- Semaine 1 ---
  // ──────────────────────────────────────────────
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
          {
            name: 'Rotations articulaires',
            duration: 45,
            instructions: 'Cou, épaules, poignets, hanches, chevilles — lents et contrôlés',
          },
          {
            name: 'Marche sur place',
            duration: 40,
            instructions: 'Lever les genoux progressivement, balancer les bras',
          },
          {
            name: 'Cercles de hanches',
            duration: 30,
            instructions: 'Mains sur les hanches, grands cercles dans les deux sens',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Fondamentaux',
        restBetweenExercises: 45,
        exercises: [
          {
            name: 'Squats assistés',
            sets: 2,
            reps: 10,
            restBetweenSets: 30,
            instructions: "Pieds largeur épaules, descendre comme pour s'asseoir, mains devant pour l'équilibre",
          },
          {
            name: 'Pompes sur genoux',
            sets: 2,
            reps: 8,
            restBetweenSets: 30,
            instructions: 'Mains largeur épaules, genoux au sol, descendre la poitrine vers le sol',
          },
          {
            name: 'Planche sur genoux',
            sets: 2,
            reps: 1,
            restBetweenSets: 30,
            tempo: '20s maintien',
            instructions: 'Avant-bras au sol, genoux au sol, corps aligné, tenir 20 secondes',
          },
          {
            name: 'Pont fessier',
            sets: 2,
            reps: 12,
            restBetweenSets: 30,
            instructions: 'Allongé sur le dos, pieds au sol, soulever les hanches en serrant les fessiers',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Étirement quadriceps',
            duration: 30,
            instructions: 'Debout, attraper le pied derrière soi, chaque jambe',
            bilateral: true,
          },
          {
            name: 'Étirement ischio-jambiers',
            duration: 30,
            instructions: "Assis, jambes tendues, pencher le buste vers l'avant",
            bilateral: false,
          },
          {
            name: 'Étirement pectoraux',
            duration: 25,
            instructions: 'Bras contre un mur, tourner le buste doucement',
            bilateral: true,
          },
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
          {
            name: 'Marche rapide sur place',
            duration: 45,
            instructions: 'Accélérer progressivement, grands mouvements de bras',
          },
          {
            name: 'Talons-fesses légers',
            duration: 30,
            instructions: 'Sur place, ramener les talons vers les fessiers en douceur',
          },
          {
            name: 'Rotations du buste',
            duration: 30,
            instructions: 'Pieds fixes, tourner le haut du corps de gauche à droite',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Cardio Débutant',
        rounds: 3,
        restBetweenExercises: 15,
        restBetweenRounds: 60,
        exercises: [
          {
            name: 'Pas chassés',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Pas latéraux dynamiques, rester bas sur les appuis',
          },
          {
            name: 'Montées de genoux',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Lever les genoux à hauteur des hanches, rythme modéré',
          },
          {
            name: 'Squats sumo',
            mode: 'reps' as const,
            reps: 10,
            instructions: "Pieds écartés, pointes vers l'extérieur, descendre lentement",
          },
          {
            name: "Marche de l'ours",
            mode: 'timed' as const,
            duration: 20,
            instructions: 'À quatre pattes, genoux décollés du sol, avancer/reculer',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche lente sur place',
            duration: 40,
            instructions: 'Ralentir progressivement, respirer profondément',
          },
          {
            name: 'Étirement mollets',
            duration: 25,
            instructions: 'Un pied en avant, pousser le talon arrière au sol',
            bilateral: true,
          },
          {
            name: 'Respiration profonde',
            duration: 30,
            instructions: 'Inspirer 4s, bloquer 4s, expirer 4s — 3 cycles',
          },
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
          {
            name: 'Cat-cow',
            duration: 40,
            instructions: 'À quatre pattes, alterner dos rond et dos creux en respirant',
          },
          {
            name: 'Rotation thoracique',
            duration: 35,
            instructions: 'À quatre pattes, une main derrière la tête, ouvrir le coude vers le ciel',
            bilateral: true,
          },
          {
            name: 'Balancement des bras',
            duration: 25,
            instructions: 'Debout, laisser les bras se balancer de gauche à droite',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Core & Posture',
        restBetweenExercises: 40,
        exercises: [
          {
            name: 'Dead bug',
            sets: 2,
            reps: 8,
            restBetweenSets: 25,
            instructions: 'Allongé, bras tendus vers le plafond, étendre une jambe et le bras opposé',
            bilateral: true,
          },
          {
            name: 'Superman',
            sets: 2,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Allongé sur le ventre, lever bras et jambes simultanément, tenir 2s',
          },
          {
            name: 'Gainage latéral sur genoux',
            sets: 2,
            reps: 1,
            restBetweenSets: 20,
            tempo: '15s par côté',
            instructions: 'Sur le coude et le genou, corps aligné, tenir 15 secondes chaque côté',
            bilateral: true,
          },
          {
            name: 'Fentes arrière',
            sets: 2,
            reps: 8,
            restBetweenSets: 30,
            instructions: 'Un grand pas en arrière, genou frôle le sol, remonter',
            bilateral: true,
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: "Child's pose",
            duration: 35,
            instructions: 'Genoux au sol, bras tendus devant, relâcher le dos',
          },
          {
            name: 'Torsion allongée',
            duration: 30,
            instructions: "Allongé, ramener un genou vers la poitrine et le laisser tomber de l'autre côté",
            bilateral: true,
          },
          {
            name: 'Étirement psoas',
            duration: 25,
            instructions: "Fente basse, pousser la hanche du genou au sol vers l'avant",
            bilateral: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // --- Semaine 2 ---
  // ──────────────────────────────────────────────
  {
    date: '',
    title: 'Full-Body Progression',
    description: 'On reprend les fondamentaux avec plus de volume et moins de repos',
    estimatedDuration: 28,
    focus: ['full-body', 'renforcement'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement actif',
        exercises: [
          {
            name: 'Jumping jacks légers',
            duration: 40,
            instructions: 'Sauts modérés, bras au-dessus de la tête, rythme confortable',
          },
          {
            name: 'Cercles de bras',
            duration: 30,
            instructions: 'Petits cercles puis grands cercles, en avant puis en arrière',
          },
          {
            name: 'Squats de mobilité',
            duration: 35,
            instructions:
              "Descendre doucement en squat profond, coudes à l'intérieur des genoux pour ouvrir les hanches",
          },
        ],
      },
      {
        type: 'classic',
        name: 'Renforcement global',
        restBetweenExercises: 40,
        exercises: [
          {
            name: 'Squats',
            sets: 3,
            reps: 12,
            restBetweenSets: 25,
            instructions: 'Pieds largeur épaules, descente contrôlée, pousser à travers les talons',
          },
          {
            name: 'Pompes sur genoux',
            sets: 2,
            reps: 10,
            restBetweenSets: 25,
            instructions: "Descendre la poitrine jusqu'au sol, remonter en expirant, garder les abdos serrés",
          },
          {
            name: 'Fentes alternées',
            sets: 2,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Grand pas en avant, genou arrière frôle le sol, alterner les jambes',
            bilateral: true,
          },
          {
            name: 'Planche sur genoux',
            sets: 2,
            reps: 1,
            restBetweenSets: 25,
            tempo: '25s maintien',
            instructions: 'Avant-bras au sol, genoux au sol, serrer les abdos, tenir 25 secondes',
          },
          {
            name: 'Pont fessier',
            sets: 3,
            reps: 15,
            restBetweenSets: 20,
            instructions: 'Soulever les hanches, serrer les fessiers en haut 2 secondes, redescendre',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Étirement quadriceps debout',
            duration: 30,
            instructions: 'Attraper le pied, tirer le talon vers les fessiers, garder le genou pointé vers le sol',
            bilateral: true,
          },
          {
            name: 'Étirement fléchisseurs de hanche',
            duration: 30,
            instructions: "Genou au sol, avancer le bassin, sentir l'étirement devant la hanche",
            bilateral: true,
          },
          {
            name: 'Étirement dos',
            duration: 25,
            instructions: 'Debout, croiser les mains devant soi, arrondir le dos en poussant les mains loin',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio Progressif',
    description: "Circuits plus longs avec des mouvements dynamiques pour améliorer l'endurance",
    estimatedDuration: 28,
    focus: ['cardio', 'endurance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement cardio',
        exercises: [
          {
            name: 'Montées de genoux modérées',
            duration: 40,
            instructions: 'Lever les genoux au-dessus des hanches, bras en opposition, rythme soutenu',
          },
          {
            name: 'Pas chassés',
            duration: 35,
            instructions: 'Pas latéraux rapides sur 3 mètres, toucher le sol à chaque côté',
          },
          {
            name: 'Rotations de hanches dynamiques',
            duration: 30,
            instructions: "Lever un genou, faire un cercle vers l'extérieur, alterner",
            bilateral: true,
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Endurance',
        rounds: 3,
        restBetweenExercises: 10,
        restBetweenRounds: 50,
        exercises: [
          {
            name: 'Jumping jacks',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Sauts avec bras au-dessus de la tête, revenir pieds joints bras le long du corps',
          },
          {
            name: 'Squats avec impulsion',
            mode: 'reps' as const,
            reps: 12,
            instructions: 'Squat classique, se mettre sur la pointe des pieds en remontant',
          },
          {
            name: 'Mountain climbers lents',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Position de pompe, ramener un genou vers la poitrine en alternant, rythme contrôlé',
          },
          {
            name: 'Pas chassés + toucher sol',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Trois pas latéraux, toucher le sol de la main extérieure, repartir',
          },
          {
            name: 'Fentes sautées légères',
            mode: 'reps' as const,
            reps: 8,
            instructions: 'Petits sauts pour alterner jambe avant et arrière, atterrir en douceur',
            bilateral: true,
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche sur place',
            duration: 40,
            instructions: 'Ralentir progressivement, grandes inspirations par le nez',
          },
          {
            name: 'Étirement mollets au mur',
            duration: 25,
            instructions: 'Mains au mur, un pied en arrière, talon au sol, pousser le mur',
            bilateral: true,
          },
          {
            name: 'Étirement adducteurs debout',
            duration: 30,
            instructions: "Pieds très écartés, fléchir une jambe latéralement, sentir l'étirement sur la jambe tendue",
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Core & Stabilité',
    description: 'Renforcement du centre du corps avec des exercices plus longs et contrôlés',
    estimatedDuration: 28,
    focus: ['core', 'stabilité'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement ciblé',
        exercises: [
          {
            name: 'Cat-cow',
            duration: 35,
            instructions: "Dos rond sur l'expiration, dos creux sur l'inspiration, 8 répétitions",
          },
          {
            name: 'Glute bridge',
            duration: 35,
            instructions: 'Monter les hanches sur 3 secondes, tenir 2 secondes en haut, redescendre sur 3 secondes',
          },
          {
            name: 'Bird dog alterné',
            duration: 35,
            instructions: 'À quatre pattes, tendre bras droit et jambe gauche, alterner lentement',
            bilateral: true,
          },
        ],
      },
      {
        type: 'classic',
        name: 'Gainage & Contrôle',
        restBetweenExercises: 35,
        exercises: [
          {
            name: 'Dead bug',
            sets: 3,
            reps: 10,
            restBetweenSets: 20,
            instructions: 'Dos plaqué au sol, tendre bras et jambe opposés, revenir lentement',
            bilateral: true,
          },
          {
            name: 'Superman avec pause',
            sets: 2,
            reps: 10,
            restBetweenSets: 25,
            instructions: 'Lever bras et jambes, tenir 3 secondes en haut, redescendre lentement',
          },
          {
            name: 'Planche sur genoux',
            sets: 3,
            reps: 1,
            restBetweenSets: 20,
            tempo: '30s maintien',
            instructions: 'Avant-bras au sol, genoux au sol, serrer le ventre, tenir 30 secondes',
          },
          {
            name: 'Gainage latéral sur genoux',
            sets: 2,
            reps: 1,
            restBetweenSets: 20,
            tempo: '20s par côté',
            instructions: 'Coude et genou au sol, hanches hautes, corps aligné, tenir 20 secondes par côté',
            bilateral: true,
          },
          {
            name: 'Crunch inversé',
            sets: 2,
            reps: 12,
            restBetweenSets: 20,
            instructions:
              'Allongé sur le dos, genoux à 90°, ramener les genoux vers la poitrine en décollant les hanches',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements profonds',
        exercises: [
          {
            name: "Child's pose",
            duration: 35,
            instructions: 'Fesses sur les talons, bras tendus devant, front au sol, relâcher complètement',
          },
          {
            name: 'Cobra doux',
            duration: 30,
            instructions:
              'Allongé sur le ventre, mains sous les épaules, relever le buste doucement en gardant le bassin au sol',
          },
          {
            name: 'Torsion assise',
            duration: 30,
            instructions: 'Assis jambes croisées, tourner le buste, main sur le genou opposé, regarder derrière',
            bilateral: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // --- Semaine 3 ---
  // ──────────────────────────────────────────────
  {
    date: '',
    title: 'Full-Body Intermédiaire',
    description: 'Variantes complètes des mouvements fondamentaux : planche pieds, pompes standard',
    estimatedDuration: 30,
    focus: ['full-body', 'force'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 40,
            instructions: 'Rythme modéré, bras bien tendus au-dessus de la tête',
          },
          {
            name: 'Fentes de mobilité',
            duration: 40,
            instructions: 'Fente avant profonde, coude vers le pied avant, rotation du buste, alterner',
            bilateral: true,
          },
          {
            name: 'Inchworm',
            duration: 35,
            instructions: "Debout, poser les mains au sol, marcher jusqu'en position de planche, revenir debout",
          },
        ],
      },
      {
        type: 'classic',
        name: 'Renforcement complet',
        restBetweenExercises: 35,
        exercises: [
          {
            name: 'Squats',
            sets: 3,
            reps: 15,
            restBetweenSets: 20,
            instructions: 'Descente sur 2 secondes, pause en bas, remonter en expirant, talons au sol',
          },
          {
            name: 'Pompes classiques',
            sets: 3,
            reps: 8,
            restBetweenSets: 25,
            instructions: 'Corps gainé de la tête aux pieds, descendre la poitrine au sol, coudes à 45°',
          },
          {
            name: 'Fentes arrière',
            sets: 3,
            reps: 10,
            restBetweenSets: 20,
            instructions: 'Grand pas en arrière, genou frôle le sol, torse droit, alterner',
            bilateral: true,
          },
          {
            name: 'Planche complète',
            sets: 3,
            reps: 1,
            restBetweenSets: 20,
            tempo: '30s maintien',
            instructions: 'Sur les avant-bras et les pointes de pieds, corps droit, serrer abdos et fessiers',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          {
            name: 'Étirement piriforme',
            duration: 30,
            instructions: 'Allongé, croiser une cheville sur le genou opposé, tirer la cuisse vers soi',
            bilateral: true,
          },
          {
            name: 'Étirement épaules',
            duration: 25,
            instructions: "Passer un bras devant la poitrine, le maintenir avec l'autre main",
            bilateral: true,
          },
          {
            name: 'Étirement ischio-jambiers debout',
            duration: 30,
            instructions: 'Un pied sur un support bas, jambe tendue, pencher le buste en gardant le dos droit',
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio EMOM',
    description: "Introduction du format EMOM pour structurer l'effort cardio avec régularité",
    estimatedDuration: 28,
    focus: ['cardio', 'rythme'],
    blocks: [
      {
        type: 'warmup',
        name: 'Activation cardio',
        exercises: [
          {
            name: 'Course sur place',
            duration: 40,
            instructions: 'Trottiner sur place, monter progressivement le rythme',
          },
          {
            name: 'Montées de genoux dynamiques',
            duration: 35,
            instructions: 'Genoux hauts, bras en opposition, rythme soutenu',
          },
          {
            name: 'Squats sautés légers',
            duration: 30,
            instructions: 'Squat classique puis petit saut, atterrir en douceur sur la plante des pieds',
          },
        ],
      },
      {
        type: 'emom',
        name: 'EMOM Cardio 8 min',
        minutes: 8,
        exercises: [
          {
            name: 'Burpees sans saut (min impaires)',
            reps: 5,
            instructions: 'Descendre au sol, poitrine au sol, remonter debout, pas de saut en haut',
          },
          {
            name: 'Montées de genoux rapides (min paires)',
            reps: 15,
            instructions: 'Genoux au-dessus des hanches, bras en opposition, rythme rapide',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Finisher Cardio',
        rounds: 2,
        restBetweenExercises: 10,
        restBetweenRounds: 45,
        exercises: [
          {
            name: 'Jumping jacks',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Rythme rapide, bras tendus, rester léger sur les appuis',
          },
          {
            name: 'Squats sumo dynamiques',
            mode: 'reps' as const,
            reps: 12,
            instructions: 'Pieds écartés, descendre et remonter sans pause, garder le buste droit',
          },
          {
            name: "Planche avec toucher d'épaule",
            mode: 'reps' as const,
            reps: 10,
            instructions:
              "En position de pompe, toucher l'épaule opposée avec la main, alterner sans bouger les hanches",
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche lente',
            duration: 40,
            instructions: 'Ralentir progressivement, baisser le rythme cardiaque',
          },
          {
            name: 'Étirement quadriceps',
            duration: 25,
            instructions: 'Debout, attraper un pied, tirer le talon vers les fessiers',
            bilateral: true,
          },
          {
            name: 'Respiration diaphragmatique',
            duration: 35,
            instructions: 'Allongé, mains sur le ventre, inspirer en gonflant le ventre sur 5s, expirer sur 5s',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Core Avancé',
    description: 'Gainage complet sur les pieds et exercices de stabilité plus exigeants',
    estimatedDuration: 30,
    focus: ['core', 'stabilité'],
    blocks: [
      {
        type: 'warmup',
        name: 'Réveil du core',
        exercises: [
          {
            name: 'Cat-cow dynamique',
            duration: 35,
            instructions: 'Alterner dos rond et creux rapidement, bien synchroniser avec la respiration',
          },
          {
            name: 'Dead bug lent',
            duration: 40,
            instructions: "Bras et jambes en l'air, étendre une jambe et le bras opposé très lentement, revenir",
            bilateral: true,
          },
          {
            name: 'Rotation thoracique debout',
            duration: 30,
            instructions: 'Bras croisés sur la poitrine, tourner le haut du corps de chaque côté',
          },
        ],
      },
      {
        type: 'classic',
        name: 'Gainage renforcé',
        restBetweenExercises: 30,
        exercises: [
          {
            name: 'Planche complète',
            sets: 3,
            reps: 1,
            restBetweenSets: 20,
            tempo: '35s maintien',
            instructions: 'Sur les avant-bras et pointes de pieds, corps parfaitement aligné, serrer abdos et fessiers',
          },
          {
            name: 'Gainage latéral',
            sets: 3,
            reps: 1,
            restBetweenSets: 15,
            tempo: '20s par côté',
            instructions: 'Sur le coude et les pieds empilés, hanches hautes, tenir 20 secondes chaque côté',
            bilateral: true,
          },
          {
            name: 'Dead bug avec extension complète',
            sets: 3,
            reps: 10,
            restBetweenSets: 20,
            instructions:
              'Dos plaqué au sol, étendre complètement bras et jambe opposés, frôler le sol sans le toucher',
            bilateral: true,
          },
          {
            name: 'Bicycle crunchs',
            sets: 3,
            reps: 12,
            restBetweenSets: 20,
            instructions: 'Allongé, mains derrière la tête, coude vers genou opposé en pédalant, rythme contrôlé',
            bilateral: true,
          },
          {
            name: 'Superman nageur',
            sets: 3,
            reps: 10,
            restBetweenSets: 20,
            instructions: 'Sur le ventre, lever bras et jambes, alterner bras droit/jambe gauche comme en nageant',
            bilateral: true,
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements profonds',
        exercises: [
          {
            name: "Child's pose",
            duration: 35,
            instructions:
              'Genoux écartés, bras tendus devant, front au sol, laisser le buste descendre entre les cuisses',
          },
          {
            name: 'Cobra',
            duration: 30,
            instructions:
              'Allongé sur le ventre, pousser sur les mains pour relever le buste, garder les hanches au sol',
          },
          {
            name: 'Torsion allongée',
            duration: 30,
            instructions: "Allongé, bras en croix, ramener les genoux d'un côté, tourner la tête de l'autre côté",
            bilateral: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // --- Semaine 4 ---
  // ──────────────────────────────────────────────
  {
    date: '',
    title: 'Full-Body Challenge',
    description: 'Mouvements combinés et supersets pour un entraînement complet et stimulant',
    estimatedDuration: 30,
    focus: ['full-body', 'endurance musculaire'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement complet',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 40,
            instructions: 'Rythme soutenu, bras bien tendus, pieds décollent du sol',
          },
          {
            name: 'Inchworm + pompe',
            duration: 45,
            instructions: 'Debout, poser les mains au sol, avancer en planche, 1 pompe, revenir debout',
          },
          {
            name: 'Squat + rotation du buste',
            duration: 35,
            instructions: "Descendre en squat, en bas tourner le buste d'un côté bras tendu, alterner à chaque rep",
          },
        ],
      },
      {
        type: 'superset',
        name: 'Supersets Full-Body',
        sets: 3,
        restBetweenSets: 30,
        restBetweenPairs: 20,
        pairs: [
          {
            exercises: [
              {
                name: 'Squats',
                reps: 15,
                instructions: 'Descente sur 2 secondes, remonter dynamiquement, ne pas verrouiller les genoux',
              },
              {
                name: 'Pompes classiques',
                reps: 10,
                instructions: 'Corps gainé, descente contrôlée, coudes à 45°, remonter en expirant',
              },
            ],
          },
          {
            exercises: [
              {
                name: 'Fentes alternées',
                reps: 12,
                instructions: 'Grand pas en avant, genou arrière frôle le sol, buste droit, alterner',
              },
              {
                name: "Planche avec toucher d'épaule",
                reps: 12,
                instructions: "Position de pompe, toucher l'épaule opposée, garder les hanches stables, alterner",
              },
            ],
          },
        ],
      },
      {
        type: 'classic',
        name: 'Finisher',
        restBetweenExercises: 25,
        exercises: [
          {
            name: 'Glute bridge marché',
            sets: 3,
            reps: 10,
            restBetweenSets: 20,
            instructions:
              "Hanches en haut, faire un pas en avant avec un pied puis l'autre, revenir, garder les hanches hautes",
            bilateral: true,
          },
          {
            name: 'Planche complète',
            sets: 2,
            reps: 1,
            restBetweenSets: 15,
            tempo: '40s maintien',
            instructions:
              'Position complète sur les avant-bras, corps droit, serrer abdos et fessiers, tenir 40 secondes',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements complets',
        exercises: [
          {
            name: 'Étirement quadriceps',
            duration: 25,
            instructions: 'Debout, attraper le pied, tirer vers les fessiers, garder les genoux serrés',
            bilateral: true,
          },
          {
            name: 'Étirement pectoraux au mur',
            duration: 25,
            instructions: 'Bras en L contre le mur, tourner le corps pour ouvrir la poitrine',
            bilateral: true,
          },
          {
            name: "Child's pose",
            duration: 30,
            instructions: 'Fesses sur les talons, bras tendus devant, respirer profondément',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Cardio Intense',
    description: 'Circuit exigeant combinant mouvements composés et rythme soutenu',
    estimatedDuration: 30,
    focus: ['cardio', 'puissance'],
    blocks: [
      {
        type: 'warmup',
        name: 'Activation intense',
        exercises: [
          {
            name: 'Course sur place',
            duration: 40,
            instructions: 'Monter le rythme progressivement sur 40 secondes, terminer en sprint léger',
          },
          {
            name: 'Squats sautés',
            duration: 30,
            instructions: 'Squat profond, sauter en remontant, atterrir en douceur, enchaîner',
          },
          {
            name: 'Mountain climbers lents',
            duration: 30,
            instructions: 'Position de planche, ramener les genoux vers la poitrine en alternant, rythme contrôlé',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Haute Énergie',
        rounds: 4,
        restBetweenExercises: 10,
        restBetweenRounds: 45,
        exercises: [
          {
            name: 'Burpees sans saut',
            mode: 'reps' as const,
            reps: 6,
            instructions: 'Descendre au sol, poitrine au sol, remonter debout, enchaîner rapidement',
          },
          {
            name: 'Mountain climbers rapides',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Position de planche, alterner genoux vers poitrine le plus vite possible',
          },
          {
            name: 'Squats sautés',
            mode: 'reps' as const,
            reps: 10,
            instructions: 'Descente contrôlée, sauter dynamiquement, atterrir pieds à plat en douceur',
          },
          {
            name: 'Planche avec rotation',
            mode: 'reps' as const,
            reps: 8,
            instructions: "Position de pompe, tourner le corps d'un côté bras au ciel, revenir, alterner",
            bilateral: true,
          },
          {
            name: 'Montées de genoux rapides',
            mode: 'timed' as const,
            duration: 20,
            instructions: 'Sprint sur place, genoux le plus haut possible, bras en opposition',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche sur place décélérée',
            duration: 45,
            instructions: 'Commencer vite et ralentir progressivement, grandes respirations',
          },
          {
            name: 'Étirement ischio-jambiers',
            duration: 30,
            instructions: 'Debout, un pied sur un support, jambe tendue, pencher le buste doucement',
            bilateral: true,
          },
          {
            name: 'Étirement mollets et chevilles',
            duration: 25,
            instructions: "Pointe du pied sur une marche, laisser le talon descendre, sentir l'étirement",
            bilateral: true,
          },
          {
            name: 'Respiration 4-7-8',
            duration: 30,
            instructions: 'Inspirer 4s, bloquer 7s, expirer 8s — 2 cycles pour ralentir le rythme cardiaque',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Core & Contrôle Total',
    description: 'Séance finale combinant gainage, stabilité et mouvements composés pour le core',
    estimatedDuration: 30,
    focus: ['core', 'contrôle'],
    blocks: [
      {
        type: 'warmup',
        name: 'Activation profonde',
        exercises: [
          {
            name: 'Cat-cow dynamique',
            duration: 35,
            instructions: 'Enchaîner dos rond et dos creux à un rythme soutenu, bien respirer',
          },
          {
            name: 'Inchworm',
            duration: 40,
            instructions: 'Debout, mains au sol, avancer en planche, tenir 2s, revenir debout',
          },
          {
            name: 'Dead bug échauffement',
            duration: 30,
            instructions: 'Dos au sol, bras et genoux à 90°, étendre doucement un bras et la jambe opposée',
            bilateral: true,
          },
        ],
      },
      {
        type: 'emom',
        name: 'EMOM Gainage 6 min',
        minutes: 6,
        exercises: [
          {
            name: 'Planche complète (min impaires)',
            reps: 1,
            instructions: 'Tenir 30 secondes en planche sur les avant-bras, repos le temps restant',
          },
          {
            name: 'Bicycle crunchs (min paires)',
            reps: 15,
            instructions: 'Coude vers genou opposé en pédalant, rythme contrôlé, repos le temps restant',
          },
        ],
      },
      {
        type: 'superset',
        name: 'Supersets Core',
        sets: 3,
        restBetweenSets: 25,
        restBetweenPairs: 15,
        pairs: [
          {
            exercises: [
              {
                name: 'Dead bug complet',
                reps: 12,
                instructions: 'Extension complète bras et jambe opposés, dos plaqué au sol, mouvement lent',
              },
              {
                name: 'Superman avec pause',
                reps: 10,
                instructions: 'Lever bras et jambes, tenir 3 secondes en haut, redescendre sur 2 secondes',
              },
            ],
          },
          {
            exercises: [
              {
                name: 'Gainage latéral avec rotation',
                reps: 8,
                instructions:
                  'Sur le coude, pieds empilés, tourner le buste vers le sol puis ouvrir bras au ciel, alterner',
              },
              {
                name: 'Hip thrust unilatéral',
                reps: 10,
                instructions: "Un pied au sol, l'autre jambe tendue en l'air, monter les hanches en serrant le fessier",
              },
            ],
          },
        ],
      },
      {
        type: 'classic',
        name: 'Finisher stabilité',
        restBetweenExercises: 20,
        exercises: [
          {
            name: 'Planche avec toucher pied',
            sets: 2,
            reps: 8,
            restBetweenSets: 20,
            instructions: 'En planche haute, monter les hanches en pike, toucher le pied opposé avec la main, revenir',
            bilateral: true,
          },
          {
            name: 'Hollow hold',
            sets: 2,
            reps: 1,
            restBetweenSets: 15,
            tempo: '20s maintien',
            instructions:
              'Allongé sur le dos, bras tendus derrière la tête, jambes tendues, décoller épaules et pieds du sol',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Détente finale',
        exercises: [
          {
            name: "Child's pose",
            duration: 40,
            instructions: 'Genoux écartés, bras tendus devant, relâcher complètement le dos et les épaules',
          },
          {
            name: 'Torsion allongée',
            duration: 30,
            instructions: "Bras en croix, amener les genoux d'un côté, regard de l'autre côté, respirer profondément",
            bilateral: true,
          },
          {
            name: 'Savasana',
            duration: 40,
            instructions:
              'Allongé sur le dos, bras le long du corps paumes vers le ciel, fermer les yeux, respirer calmement',
          },
        ],
      },
    ],
  },
];
