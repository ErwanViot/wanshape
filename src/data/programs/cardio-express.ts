import type { Session } from '../../types/session.ts';

/** Programme Cardio Express — 4 semaines (3 séances/semaine) */
export const cardioExpressSessions: Session[] = [
  // --- Semaine 1 ---
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

  // --- Semaine 2 ---
  {
    date: '',
    title: 'HIIT Accélération',
    description: 'Intervalles plus longs et exercices plus exigeants pour franchir un cap',
    estimatedDuration: 24,
    focus: ['cardio', 'HIIT'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement progressif',
        exercises: [
          {
            name: 'Jumping jacks croisés',
            duration: 35,
            instructions: 'Jumping jacks en croisant bras et jambes alternativement',
          },
          {
            name: 'Montées de genoux',
            duration: 30,
            instructions: 'Monter les genoux au-dessus de la hanche, bras en opposition',
          },
          {
            name: 'Inchworms',
            duration: 35,
            instructions: 'Debout, poser les mains au sol, marcher en planche, revenir debout',
          },
        ],
      },
      {
        type: 'hiit',
        name: 'HIIT 35/25',
        rounds: 10,
        work: 35,
        rest: 25,
        exercises: [
          { name: 'Burpees avec pompe', instructions: 'Burpee complet avec pompe stricte au sol, explosion maximale' },
          { name: 'Jump squats', instructions: 'Squat profond, sauter le plus haut possible, amortir en silence' },
          { name: 'Mountain climbers croisés', instructions: 'Genou vers le coude opposé en planche, rythme soutenu' },
          {
            name: 'Fentes sautées alternées',
            instructions: 'Alterner les fentes en sautant, genou arrière frôle le sol',
          },
          { name: 'Plank shoulder taps', instructions: 'En planche, toucher épaule opposée sans tourner les hanches' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Marche sur place', duration: 40, instructions: 'Décélérer progressivement, respirer profondément' },
          {
            name: 'Étirement ischio-jambiers',
            duration: 30,
            instructions: 'Jambe tendue sur un support bas, pencher le buste en avant',
            bilateral: true,
          },
          {
            name: 'Respiration diaphragmatique',
            duration: 30,
            instructions: 'Main sur le ventre, inspirer en gonflant le ventre, expirer lentement',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Tabata Double Impact',
    description: 'Deux blocs Tabata avec des exercices composés pour doubler la dépense',
    estimatedDuration: 22,
    focus: ['cardio', 'Tabata'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement cardio',
        exercises: [
          {
            name: 'High knees progressifs',
            duration: 35,
            instructions: 'Commencer lentement, accélérer toutes les 10 secondes',
          },
          {
            name: 'Fentes latérales dynamiques',
            duration: 30,
            instructions: 'Pas latéral large, descendre en fente, alterner rapidement',
            bilateral: true,
          },
          {
            name: 'Pompes inclinées rapides',
            duration: 25,
            instructions: 'Mains sur un support, pompes rapides pour activer le haut du corps',
          },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Bas du corps',
        sets: 2,
        rounds: 8,
        work: 20,
        rest: 10,
        restBetweenSets: 45,
        exercises: [
          { name: 'Squat jumps', instructions: 'Squat profond, exploser vers le haut, réception souple' },
          { name: 'Skaters larges', instructions: 'Grands sauts latéraux, toucher le sol avec la main opposée' },
          { name: 'Fentes sautées', instructions: 'Alterner les fentes en sautant, amplitude maximale' },
          { name: 'Sprint sur place', instructions: 'Courir sur place le plus vite possible, bras puissants' },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Haut du corps',
        sets: 1,
        rounds: 8,
        work: 20,
        rest: 10,
        exercises: [
          { name: 'Pompes explosives', instructions: 'Pompe rapide avec poussée, mains décollent du sol' },
          { name: 'Plank jacks', instructions: 'En planche, écarter et resserrer les pieds en sautant vite' },
          { name: 'Pompes diamant', instructions: 'Mains rapprochées sous la poitrine, descendre et remonter vite' },
          { name: 'Bear crawl sur place', instructions: 'Position ours, avancer/reculer les mains rapidement' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements',
        exercises: [
          { name: 'Marche lente', duration: 40, instructions: 'Ralentir le pas, respirer par le nez' },
          {
            name: 'Étirement quadriceps debout',
            duration: 25,
            instructions: 'Attraper la cheville, pousser la hanche en avant',
            bilateral: true,
          },
          {
            name: 'Étirement pectoraux',
            duration: 25,
            instructions: 'Bras tendu contre un mur, tourner le buste pour ouvrir la poitrine',
            bilateral: true,
          },
          {
            name: "Posture de l'enfant",
            duration: 30,
            instructions: 'Genoux au sol, bras allongés devant, respirer profondément',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Circuit Endurance-Puissance',
    description: 'Plus de tours, moins de repos — construire une endurance solide',
    estimatedDuration: 25,
    focus: ['cardio', 'circuit'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement complet',
        exercises: [
          {
            name: 'Jumping jacks',
            duration: 30,
            instructions: 'Rythme soutenu, bras bien tendus au-dessus de la tête',
          },
          {
            name: 'Montées de genoux avec rotation',
            duration: 30,
            instructions: 'Genoux hauts avec rotation du torse vers le genou qui monte',
          },
          {
            name: 'Squat to stand',
            duration: 30,
            instructions: 'Descendre en squat profond, tendre les jambes mains au sol, remonter',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Endurance',
        rounds: 5,
        restBetweenExercises: 8,
        restBetweenRounds: 35,
        exercises: [
          {
            name: 'Burpees latéraux',
            mode: 'reps' as const,
            reps: 8,
            instructions: 'Burpee classique avec un saut latéral entre chaque répétition',
          },
          {
            name: 'Mountain climbers rapides',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'Rythme maximal, hanches basses, genoux vers la poitrine',
          },
          {
            name: 'Squat pulse sauté',
            mode: 'reps' as const,
            reps: 10,
            instructions: '3 pulses en bas du squat puis sauter explosif, enchaîner',
          },
          {
            name: 'Planche dynamique',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Alterner planche bras tendus et planche sur les coudes sans pause',
          },
          {
            name: 'Tuck jumps',
            mode: 'reps' as const,
            reps: 6,
            instructions: 'Sauter en ramenant les deux genoux vers la poitrine',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          {
            name: 'Marche en cercle',
            duration: 40,
            instructions: 'Marcher doucement en cercle, bras ballants, respirer calmement',
          },
          {
            name: 'Étirement psoas',
            duration: 30,
            instructions: 'Genou au sol, pousser la hanche en avant, bras levé du même côté',
            bilateral: true,
          },
          {
            name: 'Respiration carrée',
            duration: 35,
            instructions: 'Inspirer 4s, retenir 4s, expirer 4s, retenir 4s — 3 cycles',
          },
        ],
      },
    ],
  },

  // --- Semaine 3 ---
  {
    date: '',
    title: 'HIIT Puissance Maximale',
    description: 'Exercices composés et explosifs pour repousser le seuil anaérobie',
    estimatedDuration: 24,
    focus: ['cardio', 'HIIT'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement intensif',
        exercises: [
          {
            name: 'Burpees lents',
            duration: 40,
            instructions: 'Burpees contrôlés et complets pour activer tout le corps',
          },
          {
            name: 'Fentes avec rotation',
            duration: 30,
            instructions: 'Fente avant, tourner le buste vers le genou avant, alterner',
            bilateral: true,
          },
          {
            name: 'Jumping jacks étoile',
            duration: 30,
            instructions: 'Jumping jack en écartant au maximum bras et jambes en étoile',
          },
        ],
      },
      {
        type: 'hiit',
        name: 'HIIT 40/20',
        rounds: 10,
        work: 40,
        rest: 20,
        exercises: [
          { name: 'Burpee tuck jumps', instructions: 'Burpee complet avec tuck jump au lieu du saut classique' },
          { name: 'Squats sautés groupés', instructions: 'Squat profond, sauter en ramenant les genoux à la poitrine' },
          {
            name: 'Mountain climbers sprinter',
            instructions: 'En planche, sprinter les genoux le plus vite possible, 100 % effort',
          },
          {
            name: 'Jumping lunges explosifs',
            instructions: "Fentes sautées avec maximum de hauteur, changer en l'air",
          },
          { name: 'Sprawls', instructions: 'Se jeter au sol à plat ventre, remonter en explosant, rythme maximal' },
        ],
      },
      {
        type: 'cooldown',
        name: 'Récupération',
        exercises: [
          {
            name: 'Marche très lente',
            duration: 45,
            instructions: 'Décélérer complètement, longues respirations nasales',
          },
          {
            name: 'Étirement adducteurs',
            duration: 30,
            instructions: "Jambes écartées, descendre doucement sur un côté puis l'autre",
            bilateral: true,
          },
          {
            name: 'Respiration 4-7-8',
            duration: 35,
            instructions: 'Inspirer 4s, retenir 7s, expirer 8s — calmer le système nerveux',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Tabata Infernal',
    description: '3 sets Tabata sans répit — la séance la plus courte et la plus intense',
    estimatedDuration: 22,
    focus: ['cardio', 'Tabata'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement express',
        exercises: [
          {
            name: 'Sprint sur place',
            duration: 30,
            instructions: "Courir sur place à 70 % d'intensité, monter progressivement",
          },
          {
            name: 'Scorpion stretches',
            duration: 30,
            instructions: 'Sur le ventre, lever un pied vers la main opposée en tournant le bassin',
            bilateral: true,
          },
          {
            name: 'Squat jumps légers',
            duration: 30,
            instructions: 'Petits sauts depuis le squat pour préparer les jambes',
          },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Explosif Set A',
        sets: 1,
        rounds: 8,
        work: 20,
        rest: 10,
        exercises: [
          { name: 'Burpee tuck jumps', instructions: 'Burpee complet terminé par un saut genoux poitrine' },
          {
            name: 'Speed skaters',
            instructions: 'Sauts latéraux rapides, toucher le sol à chaque côté, rebondir vite',
          },
          { name: 'Squat 180° sautés', instructions: 'Squat, sauter avec demi-tour complet, amortir et repartir' },
          { name: 'Pompes plyo', instructions: 'Pompe explosive, mains décollent du sol, réception contrôlée' },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Explosif Set B',
        sets: 1,
        rounds: 8,
        work: 20,
        rest: 10,
        exercises: [
          { name: 'High knees sprint', instructions: 'Genoux le plus haut possible, bras puissants, vitesse maximale' },
          {
            name: 'Plank up-downs',
            instructions: 'Passer des coudes aux mains et vice-versa sans balancer les hanches',
          },
          { name: 'Jumping lunges rapides', instructions: 'Fentes sautées en alternant le plus vite possible' },
          { name: 'Sprawl to jump', instructions: 'Se jeter au sol, remonter et sauter immédiatement, enchaîner' },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Finisher',
        sets: 1,
        rounds: 8,
        work: 20,
        rest: 10,
        exercises: [
          { name: 'Burpees all-out', instructions: 'Burpees à vitesse maximale, ne rien garder en réserve' },
          { name: 'Tuck jumps', instructions: 'Sauts groupés, genoux à la poitrine, explosivité pure' },
          { name: 'Mountain climbers sprint', instructions: 'Le plus vite possible, compter chaque pied comme un rep' },
          { name: 'Star jumps', instructions: "Sauter en étoile, bras et jambes écartés en l'air, réception groupée" },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements profonds',
        exercises: [
          {
            name: 'Marche sur place',
            duration: 50,
            instructions: 'Baisser le rythme cardiaque, respirations lentes et profondes',
          },
          {
            name: 'Étirement mollets profond',
            duration: 25,
            instructions: 'Pied arrière bien à plat, pousser le talon dans le sol',
            bilateral: true,
          },
          {
            name: 'Pigeon stretch',
            duration: 30,
            instructions: 'Jambe avant pliée, jambe arrière allongée, descendre le buste',
            bilateral: true,
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Circuit Haute Intensité',
    description: 'Exercices avancés, repos minimal — un circuit de niveau supérieur',
    estimatedDuration: 25,
    focus: ['cardio', 'circuit'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement dynamique',
        exercises: [
          {
            name: 'Inchworms avec pompe',
            duration: 35,
            instructions: 'Marcher les mains en planche, faire une pompe, revenir debout',
          },
          {
            name: 'Carioca',
            duration: 30,
            instructions: 'Déplacement latéral croisé, pieds rapides, alterner les deux sens',
          },
          {
            name: 'Skipping hauts',
            duration: 30,
            instructions: 'Monter les genoux très hauts en sautillant, bras en opposition',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Level Up',
        rounds: 5,
        restBetweenExercises: 5,
        restBetweenRounds: 30,
        exercises: [
          {
            name: 'Burpee tuck jumps',
            mode: 'reps' as const,
            reps: 8,
            instructions: 'Burpee complet avec saut genoux poitrine, pas de pause entre les reps',
          },
          {
            name: 'Spider-Man mountain climbers',
            mode: 'timed' as const,
            duration: 30,
            instructions: 'En planche, genou vers le coude du même côté, alterner rapidement',
          },
          {
            name: 'Squat sauté étoile',
            mode: 'reps' as const,
            reps: 10,
            instructions: 'Squat profond, exploser en star jump, amortir en squat, enchaîner',
          },
          {
            name: 'Pompes commando',
            mode: 'timed' as const,
            duration: 25,
            instructions: 'Alterner planche coudes et planche mains, monter et descendre sans pause',
          },
          {
            name: 'Broad jump burpees',
            mode: 'reps' as const,
            reps: 6,
            instructions: 'Saut en longueur, burpee à la réception, se retourner et recommencer',
          },
          {
            name: 'High knees sprint',
            mode: 'timed' as const,
            duration: 20,
            instructions: 'Sprint genoux hauts, vitesse absolue, finir fort',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [
          { name: 'Marche lente', duration: 45, instructions: 'Ralentir progressivement, secouer bras et jambes' },
          {
            name: 'Étirement fessiers assis',
            duration: 30,
            instructions: 'Assis, croiser une cheville sur le genou opposé, tirer vers soi',
            bilateral: true,
          },
          {
            name: 'Savasana respirée',
            duration: 40,
            instructions: 'Allongé sur le dos, bras écartés, respirer profondément 5 cycles',
          },
        ],
      },
    ],
  },

  // --- Semaine 4 ---
  {
    date: '',
    title: 'HIIT Ultime',
    description: 'Le sommet du programme — travail long, repos court, exercices composés',
    estimatedDuration: 25,
    focus: ['cardio', 'HIIT'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement intense',
        exercises: [
          {
            name: 'Burpees tempo',
            duration: 40,
            instructions: 'Burpees complets à tempo modéré, chaque mouvement est précis et ample',
          },
          {
            name: 'High knees avec bras',
            duration: 35,
            instructions: 'Genoux hauts, pousser les bras au ciel à chaque montée de genou',
          },
          {
            name: 'Fentes marchées avec twist',
            duration: 30,
            instructions: 'Grande fente en avançant, tourner le buste vers le genou avant',
          },
        ],
      },
      {
        type: 'hiit',
        name: 'HIIT 45/15',
        rounds: 12,
        work: 45,
        rest: 15,
        exercises: [
          {
            name: 'Devil press',
            instructions: 'Burpee, se relever et lever les bras au-dessus de la tête en sautant, enchaîner sans pause',
          },
          {
            name: 'Squat jump tuck',
            instructions: 'Squat profond, sauter en groupé genoux poitrine, amortir et enchaîner',
          },
          {
            name: 'Mountain climbers sprint',
            instructions: 'Position planche, sprinter les genoux alternativement à vitesse maximale',
          },
          {
            name: 'Jumping lunges alternés',
            instructions: "Fentes sautées profondes, changer de jambe en l'air, explosivité pure",
          },
          {
            name: 'Sprawl to broad jump',
            instructions: 'Sprawl au sol, remonter et enchaîner un saut en longueur, revenir en arrière',
          },
          {
            name: 'Plank jacks to push-up',
            instructions: 'Deux plank jacks puis une pompe explosive, enchaîner sans repos',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Récupération finale',
        exercises: [
          { name: 'Marche très lente', duration: 50, instructions: 'Réduire le rythme cardiaque, marcher doucement' },
          {
            name: 'Étirement quadriceps profond',
            duration: 30,
            instructions: 'Debout, attraper le pied, pousser la hanche en avant, maintenir',
            bilateral: true,
          },
          {
            name: 'Étirement dos',
            duration: 30,
            instructions: 'Assis, jambes tendues, pencher le buste en avant, relâcher le dos',
          },
          {
            name: 'Respiration 4-7-8',
            duration: 35,
            instructions: 'Inspirer 4s, retenir 7s, expirer 8s — 4 cycles pour calmer le corps',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Tabata All-Out',
    description: 'Trois sets Tabata avec les exercices les plus exigeants — zéro compromis',
    estimatedDuration: 24,
    focus: ['cardio', 'Tabata'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement complet',
        exercises: [
          {
            name: 'Jumping jacks progressifs',
            duration: 35,
            instructions: 'Commencer lentement, finir à vitesse maximale',
          },
          {
            name: "World's greatest stretch",
            duration: 35,
            instructions: 'Fente, main au sol, rotation du buste bras levé, alterner',
            bilateral: true,
          },
          {
            name: 'Squat jumps crescendo',
            duration: 30,
            instructions: 'Sauter de plus en plus haut à chaque rep, monter en puissance',
          },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Devastation Set 1',
        sets: 2,
        rounds: 8,
        work: 20,
        rest: 10,
        restBetweenSets: 40,
        exercises: [
          { name: 'Burpee broad jumps', instructions: 'Burpee puis saut en longueur, se retourner et recommencer' },
          {
            name: 'Squat jump 180° continus',
            instructions: "Squat sauté avec demi-tour, ne jamais s'arrêter, tourner alternativement",
          },
          {
            name: 'Sprawls explosifs',
            instructions: 'Se jeter au sol ventre à plat, remonter en explosant vers le haut',
          },
          { name: 'Star jumps', instructions: 'Sauter en étoile maximale, bras et jambes complètement écartés' },
        ],
      },
      {
        type: 'tabata',
        name: 'Tabata Devastation Set 2',
        sets: 2,
        rounds: 8,
        work: 20,
        rest: 10,
        restBetweenSets: 40,
        exercises: [
          { name: 'Tuck jump burpees', instructions: 'Burpee terminé par un tuck jump, enchaîner immédiatement' },
          {
            name: 'Pompes plyo larges',
            instructions: 'Pompes avec poussée explosive, mains décollent et se posent plus large',
          },
          { name: 'Speed skaters profonds', instructions: 'Grands sauts latéraux, descendre très bas, toucher le sol' },
          { name: 'High knees all-out', instructions: "Sprint sur place genoux le plus haut possible, 100 % d'effort" },
        ],
      },
      {
        type: 'cooldown',
        name: 'Étirements de récupération',
        exercises: [
          {
            name: 'Marche de récupération',
            duration: 50,
            instructions: 'Marcher très lentement, respirer par le nez uniquement',
          },
          {
            name: 'Étirement ischio-jambiers',
            duration: 30,
            instructions: 'Debout, poser le talon sur un support, pencher le buste en avant',
            bilateral: true,
          },
          {
            name: 'Cobra stretch',
            duration: 25,
            instructions: 'Sur le ventre, pousser les mains pour ouvrir la poitrine, relâcher le bas du dos',
          },
          {
            name: 'Respiration complète',
            duration: 35,
            instructions: 'Inspirer ventre, côtes, poitrine — expirer lentement en vidant tout',
          },
        ],
      },
    ],
  },
  {
    date: '',
    title: 'Circuit Final Boss',
    description: 'Le circuit le plus difficile du programme — exercices composés, repos minimal, tours maximum',
    estimatedDuration: 25,
    focus: ['cardio', 'circuit'],
    blocks: [
      {
        type: 'warmup',
        name: 'Activation maximale',
        exercises: [
          {
            name: 'Burpees contrôlés',
            duration: 40,
            instructions: 'Burpees complets à rythme modéré, chaque phase est parfaite',
          },
          {
            name: 'Lateral shuffles',
            duration: 30,
            instructions: 'Déplacements latéraux rapides, toucher le sol à chaque changement de direction',
          },
          {
            name: 'A-skips',
            duration: 30,
            instructions: 'Sauts avec genoux hauts en avançant, bras en opposition, monter le rythme',
          },
        ],
      },
      {
        type: 'circuit',
        name: 'Circuit Final',
        rounds: 6,
        restBetweenExercises: 5,
        restBetweenRounds: 25,
        exercises: [
          {
            name: 'Burpee tuck jump broad jump',
            mode: 'reps' as const,
            reps: 6,
            instructions: 'Burpee, tuck jump, saut en longueur — le trio complet sans pause',
          },
          {
            name: 'Mountain climbers sprint',
            mode: 'timed' as const,
            duration: 35,
            instructions: 'Vitesse absolue, hanches basses, chaque genou touche presque le sol',
          },
          {
            name: 'Squat sauté 360°',
            mode: 'reps' as const,
            reps: 8,
            instructions: 'Squat profond, sauter en faisant un tour complet, amortir et enchaîner',
          },
          {
            name: 'Pompes superman',
            mode: 'reps' as const,
            reps: 8,
            instructions: "Pompe explosive, lever bras et jambes en l'air au sommet, réception contrôlée",
          },
          {
            name: 'High knees à tuck jumps',
            mode: 'timed' as const,
            duration: 25,
            instructions: '4 high knees rapides puis 1 tuck jump, enchaîner en boucle',
          },
          {
            name: 'Sprawl avec rotation',
            mode: 'reps' as const,
            reps: 8,
            instructions: "Sprawl au sol, remonter en tournant 180°, sprawl de l'autre côté",
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Récupération finale du programme',
        exercises: [
          {
            name: 'Marche très lente',
            duration: 50,
            instructions: 'Laisser le rythme cardiaque descendre naturellement',
          },
          {
            name: 'Étirement complet jambes',
            duration: 30,
            instructions: 'Fente basse, une jambe tendue devant, alterner',
            bilateral: true,
          },
          {
            name: 'Pigeon stretch',
            duration: 30,
            instructions: 'Jambe avant pliée au sol, jambe arrière allongée, relâcher les hanches',
            bilateral: true,
          },
          {
            name: 'Savasana finale',
            duration: 45,
            instructions: 'Allongé sur le dos, bras écartés, paumes vers le ciel — félicitations, programme terminé',
          },
        ],
      },
    ],
  },
];
