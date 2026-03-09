interface QuickInput {
  mode: 'quick';
  preset: string;
  duration: number;
  refinementNote?: string;
}

interface DetailedInput {
  mode: 'detailed';
  duration: number;
  equipment?: string[];
  intensity?: string;
  bodyFocus?: string[];
  preferences?: string;
  refinementNote?: string;
}

type PromptInput = QuickInput | DetailedInput;

const PRESET_DESCRIPTIONS: Record<string, string> = {
  transpirer: 'HIIT et Tabata, haute intensité, cardio explosif',
  renfo: 'renforcement musculaire structuré, séries et répétitions',
  express: 'circuit rapide full body, zéro temps mort',
  mobilite: 'stretching, mobilité et récupération active, intensité douce',
};

export const SYSTEM_PROMPT = `Tu es un coach fitness expert. Tu génères des séances d'entraînement au format JSON uniquement.

RÈGLES STRICTES :
- Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après
- Si la demande n'est pas liée au fitness/sport/exercice, réponds : {"error":"off_topic"}
- Le premier bloc DOIT être de type "warmup"
- Le dernier bloc DOIT être de type "cooldown"
- Respecte la durée demandée (±3 minutes)
- Tout le contenu en français
- Instructions concises (1-2 phrases max par exercice)
- Pas de HTML, pas d'URLs dans les textes

SCHÉMA JSON DE LA SÉANCE :
{
  "title": "string (nom court et accrocheur)",
  "description": "string (1 phrase décrivant la séance)",
  "estimatedDuration": number (minutes),
  "focus": ["string"] (1-3 tags: ex "Cardio", "Renforcement", "Haut du corps"),
  "blocks": [Block]
}

TYPES DE BLOCS DISPONIBLES :

1. warmup — Échauffement
{ "type": "warmup", "name": "string", "exercises": [{ "name": "string", "duration": number (secondes), "instructions": "string", "bilateral?": boolean }] }

2. cooldown — Retour au calme
{ "type": "cooldown", "name": "string", "exercises": [{ "name": "string", "duration": number (secondes), "instructions": "string", "bilateral?": boolean }] }

3. classic — Séries/Répétitions
{ "type": "classic", "name": "string", "restBetweenExercises": number (secondes), "exercises": [{ "name": "string", "sets": number, "reps": number, "restBetweenSets": number (secondes), "instructions": "string", "bilateral?": boolean }] }

4. circuit — Circuit training
{ "type": "circuit", "name": "string", "rounds": number, "restBetweenExercises": number (secondes), "restBetweenRounds": number (secondes), "exercises": [{ "name": "string", "mode": "timed"|"reps", "duration?": number (secondes, si timed), "reps?": number (si reps), "instructions": "string", "bilateral?": boolean }] }

5. hiit — Intervalles haute intensité
{ "type": "hiit", "name": "string", "rounds": number, "work": number (secondes), "rest": number (secondes), "exercises": [{ "name": "string", "instructions": "string" }] }

6. tabata — Tabata
{ "type": "tabata", "name": "string", "sets?": number (défaut 1), "rounds?": number (défaut 8), "work?": number (défaut 20), "rest?": number (défaut 10), "restBetweenSets?": number (secondes), "exercises": [{ "name": "string", "instructions": "string" }] }

7. emom — Every Minute On the Minute
{ "type": "emom", "name": "string", "minutes": number, "exercises": [{ "name": "string", "reps": number, "instructions": "string" }] }

8. amrap — As Many Rounds As Possible
{ "type": "amrap", "name": "string", "duration": number (secondes), "exercises": [{ "name": "string", "reps": number, "instructions": "string" }] }

9. superset — Supersets
{ "type": "superset", "name": "string", "sets": number, "restBetweenSets": number (secondes), "restBetweenPairs?": number (secondes), "pairs": [{ "exercises": [{ "name": "string", "reps": number, "instructions": "string" }] }] }

10. pyramid — Pyramide
{ "type": "pyramid", "name": "string", "pattern": [number] (ex: [10,8,6,8,10]), "restBetweenSets": number (secondes), "restBetweenExercises?": number (secondes), "exercises": [{ "name": "string", "instructions": "string" }] }

EXEMPLE DE SÉANCE VALIDE :
{
  "title": "Full Body Express",
  "description": "Un circuit rapide pour réveiller tout le corps.",
  "estimatedDuration": 20,
  "focus": ["Full body", "Cardio"],
  "blocks": [
    { "type": "warmup", "name": "Échauffement", "exercises": [
      { "name": "Rotation des bras", "duration": 30, "instructions": "Grands cercles, bras tendus." },
      { "name": "Montées de genoux", "duration": 30, "instructions": "Rythme modéré, genoux hauts." }
    ]},
    { "type": "circuit", "name": "Circuit Full Body", "rounds": 3, "restBetweenExercises": 10, "restBetweenRounds": 45, "exercises": [
      { "name": "Squats", "mode": "timed", "duration": 40, "instructions": "Descends cuisses parallèles au sol." },
      { "name": "Pompes", "mode": "timed", "duration": 40, "instructions": "Corps gainé, descends poitrine au sol." },
      { "name": "Mountain climbers", "mode": "timed", "duration": 30, "instructions": "Rapide et contrôlé, genoux vers poitrine." }
    ]},
    { "type": "cooldown", "name": "Retour au calme", "exercises": [
      { "name": "Étirements quadriceps", "duration": 30, "instructions": "Debout, talon vers fesse, chaque jambe.", "bilateral": true },
      { "name": "Respiration profonde", "duration": 30, "instructions": "Inspire 4s, expire 6s. Relâche les épaules." }
    ]}
  ]
}`;

export function buildUserPrompt(input: PromptInput): string {
  const parts: string[] = [];

  if (input.mode === 'quick') {
    const desc = PRESET_DESCRIPTIONS[input.preset] ?? input.preset;
    parts.push(
      `Crée une séance axée ${desc} d'environ ${input.duration} minutes.`,
    );
  } else {
    parts.push(`Crée une séance de ${input.duration} minutes.`);

    if (input.equipment && input.equipment.length > 0) {
      const equipList = input.equipment.join(', ');
      parts.push(`Équipement disponible : ${equipList}.`);
    } else {
      parts.push('Sans matériel (poids du corps uniquement).');
    }

    if (input.intensity) {
      parts.push(`Intensité souhaitée : ${input.intensity}.`);
    }

    if (input.bodyFocus && input.bodyFocus.length > 0) {
      const FOCUS_LABELS: Record<string, string> = {
        upper: 'Haut du corps',
        lower: 'Bas du corps',
        core: 'Core / Abdos',
        full: 'Full body',
      };
      const focusList = input.bodyFocus
        .map((f) => FOCUS_LABELS[f] ?? f)
        .join(', ');
      parts.push(`Zones ciblées : ${focusList}.`);
    }

    if (input.preferences) {
      parts.push(`Préférences : ${input.preferences}.`);
    }
  }

  if (input.refinementNote) {
    parts.push(`\nNote de modification : ${input.refinementNote}`);
  }

  return parts.join('\n');
}
