import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.ts";
import { validateProgram } from "./validate.ts";

const PROD_ORIGINS = [
  "https://wan2fit.fr",
  "https://www.wan2fit.fr",
];
const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:4173"];
const ALLOWED_ORIGINS = Deno.env.get("ENVIRONMENT") === "production" ? PROD_ORIGINS : [...PROD_ORIGINS, ...DEV_ORIGINS];

const DEFAULT_ORIGIN = "https://wan2fit.fr";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const MAX_ACTIVE_PROGRAMS = 3;
const MAX_DAILY_GENERATIONS = 3;
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 12288;

const VALID_OBJECTIFS = [
  'perte_poids', 'prise_muscle', 'remise_forme', 'force',
  'endurance', 'performance_sportive', 'bien_etre', 'souplesse',
];
const VALID_EXPERIENCE = ['debutant', 'six_mois_deux_ans', 'plus_deux_ans'];
const VALID_FREQUENCE = ['jamais', 'une_deux', 'trois_quatre', 'cinq_plus'];
const VALID_MATERIEL = [
  'poids_du_corps', 'halteres', 'barre_disques', 'kettlebell',
  'elastiques', 'banc', 'barre_traction', 'trx',
  'corde_a_sauter', 'medecine_ball', 'swiss_ball', 'tapis',
  'step', 'foam_roller', 'anneaux',
];
const VALID_DUREES = [4, 8, 12];

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

const VALID_BLESSURES = [
  'genou', 'dos', 'epaule', 'cheville', 'poignet', 'cervicales', 'hanche',
];
const VALID_SEXE = ['homme', 'femme', 'autre'];

interface RequestInput {
  objectifs: string[];
  objectif_detail?: string;
  experience_duree: string;
  frequence_actuelle: string;
  blessures: string[];
  blessure_detail?: string;
  age?: number;
  sexe?: string;
  seances_par_semaine: number;
  duree_seance_minutes: number;
  materiel: string[];
  duree_semaines: number;
}

function validateInput(body: RequestInput): string | null {
  if (!Array.isArray(body.objectifs) || body.objectifs.length === 0)
    return "Au moins un objectif requis";
  for (const o of body.objectifs) {
    if (!VALID_OBJECTIFS.includes(o)) return `Objectif invalide: ${o}`;
  }

  if (!VALID_EXPERIENCE.includes(body.experience_duree))
    return "experience_duree invalide";
  if (!VALID_FREQUENCE.includes(body.frequence_actuelle))
    return "frequence_actuelle invalide";

  if (!Array.isArray(body.materiel) || body.materiel.length === 0)
    return "Au moins un type de materiel requis";
  for (const m of body.materiel) {
    if (!VALID_MATERIEL.includes(m)) return `Materiel invalide: ${m}`;
  }

  if (!body.seances_par_semaine || body.seances_par_semaine < 2 || body.seances_par_semaine > 5)
    return "seances_par_semaine doit etre entre 2 et 5";

  if (!body.duree_seance_minutes || body.duree_seance_minutes < 30 || body.duree_seance_minutes > 75)
    return "duree_seance_minutes doit etre entre 30 et 75";

  if (!VALID_DUREES.includes(body.duree_semaines))
    return "duree_semaines doit etre 4, 8 ou 12";

  if (body.blessures && !Array.isArray(body.blessures))
    return "blessures doit etre un tableau";
  if (Array.isArray(body.blessures)) {
    for (const b of body.blessures) {
      if (!VALID_BLESSURES.includes(b)) return `Blessure invalide: ${b}`;
    }
  }

  if (body.age !== undefined && body.age !== null) {
    if (typeof body.age !== 'number' || body.age < 14 || body.age > 99)
      return "age doit etre un nombre entre 14 et 99";
  }

  if (body.sexe !== undefined && body.sexe !== null && body.sexe !== '') {
    if (!VALID_SEXE.includes(body.sexe)) return "sexe invalide";
  }

  if (body.objectif_detail && typeof body.objectif_detail !== "string")
    return "objectif_detail doit etre une chaine";
  if (body.objectif_detail && body.objectif_detail.length > 300)
    return "objectif_detail: 300 caracteres max";

  if (body.blessure_detail && typeof body.blessure_detail !== "string")
    return "blessure_detail doit etre une chaine";
  if (body.blessure_detail && body.blessure_detail.length > 300)
    return "blessure_detail: 300 caracteres max";

  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function nanoid(size: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz234567'; // 32 chars = power of 2
  const mask = 0x1f; // 5 bits → indices 0-31, no modulo bias
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes, (b) => chars[b & mask]).join('');
}

interface CalendrierEntry {
  semaines: number[];
  sequence: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return errorResponse(req, "Method not allowed", 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse(req, "Missing authorization", 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!anthropicApiKey) {
    return errorResponse(req, "ANTHROPIC_API_KEY not configured", 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return errorResponse(req, "Non autorise", 401);
  }

  // Check premium tier
  const { data: userProfile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (userProfile?.subscription_tier !== "premium") {
    return errorResponse(req, "Abonnement Premium requis", 403);
  }

  // Parse body
  let body: RequestInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, "JSON invalide");
  }

  // Validate input
  const inputError = validateInput(body);
  if (inputError) {
    return errorResponse(req, inputError);
  }

  // Business rule: cap seances_par_semaine for beginners
  if (['jamais', 'une_deux'].includes(body.frequence_actuelle) && body.seances_par_semaine > 3) {
    body.seances_par_semaine = 3;
  }

  // Check active programs limit
  const { count: activeCount, error: activeError } = await supabaseAdmin
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_fixed", false);

  if (activeError) {
    return errorResponse(req, "Erreur serveur", 500);
  }

  if ((activeCount ?? 0) >= MAX_ACTIVE_PROGRAMS) {
    return errorResponse(
      req,
      `Limite atteinte : ${MAX_ACTIVE_PROGRAMS} programmes actifs maximum. Supprime un programme existant pour en creer un nouveau.`,
      429,
    );
  }

  // Rate limit: 3 generations / 24h
  const { count: dailyCount, error: dailyError } = await supabaseAdmin
    .from("programs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_fixed", false)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (dailyError) {
    return errorResponse(req, "Erreur serveur", 500);
  }

  if ((dailyCount ?? 0) >= MAX_DAILY_GENERATIONS) {
    return errorResponse(
      req,
      `Limite atteinte : ${MAX_DAILY_GENERATIONS} programmes par 24h. Reessaye plus tard.`,
      429,
    );
  }

  // Build prompt
  const userPrompt = buildUserPrompt(body);

  // Call Anthropic API
  async function callAnthropic(extraMessages: { role: string; content: string }[] = []): Promise<{ data: unknown; inputTokens: number; outputTokens: number }> {
    const messages = [
      { role: "user", content: userPrompt },
      ...extraMessages,
    ];

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text().catch(() => "Unknown error");
      console.error("Anthropic API error:", aiResponse.status, errText);
      throw new Error("Erreur de generation");
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.content?.[0]?.text ?? "";

    // Parse JSON (handle potential markdown wrapper)
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      data: parsed,
      inputTokens: aiData.usage?.input_tokens ?? 0,
      outputTokens: aiData.usage?.output_tokens ?? 0,
    };
  }

  let programJson: unknown;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // First attempt
  try {
    const result = await callAnthropic();
    programJson = result.data;
    totalInputTokens = result.inputTokens;
    totalOutputTokens = result.outputTokens;
  } catch {
    return errorResponse(req, "Erreur de communication avec l'IA", 502);
  }

  // Validate
  let validation = validateProgram(programJson, body.duree_semaines, body.seances_par_semaine);

  // Retry once if invalid
  if (!validation.valid) {
    console.error("First attempt validation failed:", validation.error);
    try {
      const retryResult = await callAnthropic([
        { role: "assistant", content: JSON.stringify(programJson) },
        { role: "user", content: `Ta reponse precedente etait invalide: ${validation.error}. Corrige et renvoie le JSON complet.` },
      ]);
      programJson = retryResult.data;
      totalInputTokens += retryResult.inputTokens;
      totalOutputTokens += retryResult.outputTokens;
      validation = validateProgram(programJson, body.duree_semaines, body.seances_par_semaine);
    } catch {
      return errorResponse(req, "La generation a echoue apres retry, reessayez", 502);
    }

    if (!validation.valid) {
      console.error("Retry validation failed:", validation.error);
      return errorResponse(req, "Le programme genere est invalide, reessayez", 502);
    }
  }

  const pgm = programJson as Record<string, unknown>;
  const sessions = pgm.sessions as Record<string, Record<string, unknown>>;
  const calendrier = pgm.calendrier as CalendrierEntry[];

  // Generate slug
  const baseSlug = slugify(pgm.titre as string) || 'programme';
  const slug = `${baseSlug}-${nanoid(6)}`;

  // Map niveau to fitness_level
  const niveauMap: Record<string, string> = {
    debutant: 'beginner',
    intermediaire: 'intermediate',
    avance: 'advanced',
  };

  // INSERT program
  const { data: insertedProgram, error: insertError } = await supabaseAdmin
    .from("programs")
    .insert({
      slug,
      title: pgm.titre,
      description: pgm.description,
      goals: body.objectifs,
      duration_weeks: body.duree_semaines,
      frequency_per_week: body.seances_par_semaine,
      fitness_level: niveauMap[pgm.niveau as string] ?? 'intermediate',
      is_fixed: false,
      user_id: user.id,
      note_coach: pgm.note_coach,
      progression: pgm.progression,
      consignes_semaine: pgm.consignes_semaine,
      onboarding_data: body,
      generation_metadata: pgm,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      model: MODEL,
    })
    .select("id")
    .single();

  if (insertError || !insertedProgram) {
    console.error("Program insert error:", insertError);
    return errorResponse(req, "Erreur de sauvegarde du programme", 500);
  }

  // Build program_sessions rows
  const sessionRows: {
    program_id: string;
    week_number: number;
    session_order: number;
    session_data: Record<string, unknown>;
  }[] = [];

  let globalOrder = 1;
  for (const entry of calendrier) {
    for (const week of entry.semaines) {
      for (const sessionId of entry.sequence) {
        sessionRows.push({
          program_id: insertedProgram.id,
          week_number: week,
          session_order: globalOrder,
          session_data: sessions[sessionId],
        });
        globalOrder++;
      }
    }
  }

  // INSERT program_sessions
  const { error: sessionsError } = await supabaseAdmin
    .from("program_sessions")
    .insert(sessionRows);

  if (sessionsError) {
    console.error("Program sessions insert error:", sessionsError);
    // Rollback: delete the program, verify success
    const { error: rollbackError } = await supabaseAdmin.from("programs").delete().eq("id", insertedProgram.id).eq("user_id", user.id);
    if (rollbackError) {
      console.error("Rollback failed — orphaned program:", insertedProgram.id, rollbackError);
    }
    return errorResponse(req, "Erreur de sauvegarde des seances", 502);
  }

  return jsonResponse(req, { programId: insertedProgram.id, slug });
});
