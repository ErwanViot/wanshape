import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { buildSystemPrompt, buildUserPrompt, type Locale } from "./prompt.ts";
import { sanitizeOnboardingForPersistence } from "./sanitize.ts";
import { validateProgram } from "./validate.ts";
import { AnthropicCallError, callAnthropicJson, describeAnthropicError } from "../_shared/anthropic.ts";

const MAX_ACTIVE_PROGRAMS = 3;
const MAX_DAILY_GENERATIONS = 3;
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 12288;
// NB: no assistant-message prefill here — claude-sonnet-4-6 rejects it with a
// 400 ("This model does not support assistant message prefill"). Prompt-
// injection defence + JSON-only output are enforced by the system prompt
// instead (see prompt.ts and the callAnthropic comment below).
// Sentinel raised by the enforce_user_active_programs_cap trigger
// (migration 022). Kept as a constant so a future trigger message rename
// surfaces as a TypeScript build break rather than a silent 500.
const TRIGGER_CAP_REACHED = "active_programs_cap_reached";

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
const VALID_LOCALES: Locale[] = ["fr", "en"];

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

// Map a typed Anthropic failure to a CORS-aware error response. The taxonomy
// + message/status mapping live in _shared/anthropic.ts so generate-session
// and generate-program stay in lockstep.
function mapAnthropicError(req: Request, err: unknown): Response {
  const { message, status } = describeAnthropicError(err, "programme");
  return errorResponse(req, message, status);
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
  locale?: string;
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
    if (typeof body.age !== 'number' || body.age < 18 || body.age > 99)
      return "age doit etre un nombre entre 18 et 99";
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

  if (body.locale && !VALID_LOCALES.includes(body.locale as Locale)) {
    return "locale invalide";
  }

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
    return errorResponse(req, "Erreur de configuration serveur", 500);
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

  // Atomic rate limit: insert a tracking row first, then count. If we end up
  // over the quota we delete the just-inserted row and reject. Closes the
  // race window of "count-then-insert" where parallel calls could slip past.
  const { data: rateRow, error: rateInsertError } = await supabaseAdmin
    .from("ai_generation_calls")
    .insert({ user_id: user.id, kind: "program" })
    .select("id")
    .single();

  if (rateInsertError || !rateRow) {
    return errorResponse(req, "Erreur serveur", 500);
  }

  const { count: dailyCount, error: dailyError } = await supabaseAdmin
    .from("ai_generation_calls")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("kind", "program")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (dailyError) {
    await supabaseAdmin.from("ai_generation_calls").delete().eq("id", rateRow.id);
    return errorResponse(req, "Erreur serveur", 500);
  }

  if ((dailyCount ?? 0) > MAX_DAILY_GENERATIONS) {
    await supabaseAdmin.from("ai_generation_calls").delete().eq("id", rateRow.id);
    return errorResponse(
      req,
      `Limite atteinte : ${MAX_DAILY_GENERATIONS} programmes par 24h. Réessaye plus tard.`,
      429,
    );
  }
  // Note: rateRow is intentionally NOT deleted on downstream failures (AI
  // call, validation, DB insert). A failed attempt still counts against the
  // 24h quota to prevent free retry storms — same policy as estimate-nutrition.

  // Build prompt
  const locale: Locale = (body.locale as Locale) ?? "fr";
  const userPrompt = buildUserPrompt({ ...body, locale });
  const systemPrompt = buildSystemPrompt(locale);

  // Call Anthropic API. Sonnet with 12K tokens needs a more generous timeout
  // than the Haiku session generation. The fetch/parse/error-taxonomy lives in
  // _shared/anthropic.ts; here we only assemble the prompt turns.
  //
  // IMPORTANT: claude-sonnet-4-6 does NOT support assistant message prefill —
  // ending the conversation with an `{ role: "assistant", content: '{"' }`
  // turn returns `400 invalid_request_error: "This model does not support
  // assistant message prefill"`, which is what broke every program generation
  // in production. The conversation must end with a user message. We rely on
  // the system prompt's "REGLE ABSOLUE : Reponds UNIQUEMENT avec du JSON
  // valide" directive (+ the retry-on-parse + the ```json strip in the shared
  // helper) to keep the output parseable. prefill is "" so nothing is
  // prepended to the response.
  function callAnthropic(extraMessages: { role: string; content: string }[] = [], timeoutMs = 120_000) {
    return callAnthropicJson({
      apiKey: anthropicApiKey!,
      model: MODEL,
      maxTokens: MAX_TOKENS,
      systemPrompt,
      prefill: "",
      timeoutMs,
      messages: [
        { role: "user", content: userPrompt },
        ...extraMessages,
      ],
    });
  }

  let programJson: unknown;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // First attempt. A parse failure (the model breaking out of the forced-JSON
  // format) is transient, so we retry it once with a fresh call before giving
  // up — this is the single most common production failure and a clean retry
  // almost always recovers. API/timeout/network errors are NOT retried here:
  // a 429 needs backoff, a 401/quota error won't fix itself on an immediate
  // re-call, and a timeout would just burn another timeout window.
  try {
    let result;
    try {
      result = await callAnthropic();
    } catch (err) {
      if (err instanceof AnthropicCallError && err.kind === "parse") {
        console.error("Parse failure on first attempt — retrying once");
        result = await callAnthropic();
      } else {
        throw err;
      }
    }
    programJson = result.data;
    totalInputTokens = result.inputTokens;
    totalOutputTokens = result.outputTokens;
  } catch (err) {
    return mapAnthropicError(req, err);
  }

  // Validate
  let validation = validateProgram(programJson, body.duree_semaines, body.seances_par_semaine);

  // Retry once if invalid
  if (!validation.valid) {
    console.error("First attempt validation failed:", validation.error);
    try {
      const truncatedPrev = JSON.stringify(programJson).slice(0, 2000);
      const retryResult = await callAnthropic([
        { role: "assistant", content: truncatedPrev },
        { role: "user", content: `Ta reponse precedente etait invalide: ${validation.error}. Corrige et renvoie le JSON complet.` },
      ], 30_000);
      programJson = retryResult.data;
      totalInputTokens += retryResult.inputTokens;
      totalOutputTokens += retryResult.outputTokens;
      validation = validateProgram(programJson, body.duree_semaines, body.seances_par_semaine);
    } catch (err) {
      return mapAnthropicError(req, err);
    }

    if (!validation.valid) {
      console.error("Retry validation failed:", validation.error);
      return errorResponse(req, "Le programme généré est invalide. Réessaie.", 422);
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

  // Build program_sessions rows (program_id is filled by the RPC, not us)
  const sessionRows: {
    week_number: number;
    session_order: number;
    session_data: Record<string, unknown>;
  }[] = [];

  let globalOrder = 1;
  for (const entry of calendrier) {
    for (const week of entry.semaines) {
      for (const sessionId of entry.sequence) {
        const sessionData = sessions[sessionId];
        if (!sessionData) {
          // Malformed AI output: calendrier references a session id that
          // isn't in the sessions map. Fail fast with a clear error rather
          // than letting the RPC raise an opaque NOT NULL violation.
          console.error("Missing session data for id:", sessionId);
          return errorResponse(req, "Erreur de génération (sessions invalides)", 500);
        }
        sessionRows.push({
          week_number: week,
          session_order: globalOrder,
          session_data: sessionData,
        });
        globalOrder++;
      }
    }
  }

  // Atomic INSERT programs + program_sessions via RPC (migration 021).
  // Wrapping both writes in a single transaction prevents the orphaned-
  // program-row class of failures the previous "manual rollback" was trying
  // to handle: if the sessions insert raises, the program insert is rolled
  // back by Postgres rather than by a best-effort DELETE in JS.
  const { data: programId, error: rpcError } = await supabaseAdmin.rpc("create_program_with_sessions", {
    p_user_id: user.id,
    p_program: {
      slug,
      title: pgm.titre,
      description: pgm.description,
      goals: body.objectifs,
      duration_weeks: body.duree_semaines,
      frequency_per_week: body.seances_par_semaine,
      fitness_level: niveauMap[pgm.niveau as string] ?? "intermediate",
      note_coach: pgm.note_coach,
      progression: pgm.progression,
      consignes_semaine: pgm.consignes_semaine,
      // Strip age/sexe before persistence — RGPD art. 5(1)(c) minimization.
      // Both are still sent to Anthropic at generation time (declared in
      // the Privacy Policy) but never re-read by the app afterwards.
      onboarding_data: sanitizeOnboardingForPersistence(body),
      generation_metadata: pgm,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      model: MODEL,
      locale,
    },
    p_sessions: sessionRows,
  });

  if (rpcError || !programId) {
    console.error("Program RPC error:", rpcError);
    // The DB trigger (migration 022) raises 'active_programs_cap_reached' if
    // a race condition let us past the pre-flight count check. Translate it
    // into the same user-facing message so the experience is consistent.
    if (rpcError?.message?.includes(TRIGGER_CAP_REACHED)) {
      return errorResponse(
        req,
        `Limite atteinte : ${MAX_ACTIVE_PROGRAMS} programmes actifs maximum. Supprime un programme existant pour en creer un nouveau.`,
        429,
      );
    }
    return errorResponse(req, "Erreur de sauvegarde du programme", 500);
  }

  return jsonResponse(req, { programId, slug });
});
