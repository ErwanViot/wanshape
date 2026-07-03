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
// Raised from 12288 to absorb periodised ("phase") programs, which declare
// distinct sessions per phase (worst realistic case ~15-20 unique sessions ≈
// 14-16K output tokens + JSON overhead). Truncation is now detected via
// stop_reason in _shared/anthropic.ts rather than surfacing as a parse error.
const MAX_TOKENS = 20480;
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
const VALID_DUREES = [4, 6, 8, 12];
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
  // Revision: regenerate an existing (not-yet-started) program in place with a
  // free-text change. The onboarding fields above are resent by the client.
  revision_program_id?: string;
  revision_comment?: string;
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
    return "duree_semaines doit etre 4, 6, 8 ou 12";

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

  if (body.revision_program_id !== undefined) {
    // Validate the UUID shape here so a malformed id is a clean 400, not a
    // Postgres cast error surfaced as a 500 by the begin_program_revision RPC.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof body.revision_program_id !== "string" || !UUID_RE.test(body.revision_program_id))
      return "revision_program_id invalide";
    if (!body.revision_comment || typeof body.revision_comment !== "string" || body.revision_comment.trim().length === 0)
      return "revision_comment requis";
    if (body.revision_comment.length > 300)
      return "revision_comment: 300 caracteres max";
  }

  return null;
}

/**
 * Deterministic structure decision for the high-stakes, high-confidence case:
 * a sport-performance goal on a program long enough to periodise (≥ 6 weeks)
 * is ALWAYS phased — we never leave that to the model, because the asymmetric
 * failure (a sportif with a deadline getting a flat, repeated program) is the
 * one that matters. Every other case returns undefined and falls through to
 * the deduction rules in the system prompt (repeat is the safe default there).
 */
function classifyStructure(body: RequestInput): "phase" | undefined {
  if (body.objectifs.includes("performance_sportive") && body.duree_semaines >= 6) {
    return "phase";
  }
  return undefined;
}

// Compact, bounded summary of a previous program (from generation_metadata) fed
// to the model on a revision so it can adjust rather than start blind.
function summarizePreviousProgram(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "(programme precedent indisponible)";
  const m = meta as Record<string, unknown>;
  const lines: string[] = [];
  if (typeof m.titre === "string") lines.push(`Titre : ${m.titre}`);
  if (typeof m.structure === "string") lines.push(`Structure : ${m.structure}`);
  const sessions = m.sessions;
  if (sessions && typeof sessions === "object" && !Array.isArray(sessions)) {
    const names = Object.entries(sessions as Record<string, { title?: unknown }>)
      .map(([k, s]) => `${k}=${typeof s?.title === "string" ? s.title : "?"}`);
    if (names.length) lines.push(`Seances : ${names.join(" | ")}`);
  }
  const cal = m.calendrier;
  if (Array.isArray(cal)) {
    const phases = cal.map((e: Record<string, unknown>) =>
      `${typeof e.nom === "string" ? e.nom : "phase"} (sem ${JSON.stringify(e.semaines)}: ${JSON.stringify(e.sequence)})`
    );
    if (phases.length) lines.push(`Calendrier : ${phases.join(" ; ")}`);
  }
  return lines.join("\n").slice(0, 2000) || "(programme precedent indisponible)";
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

  // A revision regenerates an existing program in place (no new row), so it
  // skips the active-programs cap. New programs are capped.
  const isRevision = typeof body.revision_program_id === "string" && body.revision_program_id.length > 0;

  if (!isRevision) {
    // Check active programs limit. A `failed` placeholder does not consume a
    // slot (mirrors the DB trigger in migration 027), so exclude it here too.
    const { count: activeCount, error: activeError } = await supabaseAdmin
      .from("programs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_fixed", false)
      .neq("status", "failed");

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

  // Build prompt basics. classifyStructure also applies to revisions (the
  // onboarding is resent unchanged), so a sport-performance revision stays phased.
  const locale: Locale = (body.locale as Locale) ?? "fr";
  const imposedStructure = classifyStructure(body);
  const systemPrompt = buildSystemPrompt(locale);

  // Resolve the target program then respond immediately; the generation runs in
  // the background (runGeneration) under EdgeRuntime.waitUntil to escape the
  // 150s gateway idle timeout. Revision reuses the existing row; a new program
  // creates a `generating` placeholder.
  let programId: string;
  let slug: string;
  let revisionContext: { comment: string; previousSummary: string } | undefined;

  if (isRevision) {
    // Narrowed post-validateInput: both are guaranteed present for a revision.
    const revisionProgramId = body.revision_program_id as string;
    const revisionComment = body.revision_comment as string;

    // Atomically gate (owned, not-started, ready|failed) and flip to generating.
    const { data: revId, error: revErr } = await supabaseAdmin.rpc("begin_program_revision", {
      p_program_id: revisionProgramId,
      p_user_id: user.id,
    });
    if (revErr) {
      await supabaseAdmin.from("ai_generation_calls").delete().eq("id", rateRow.id);
      console.error("begin_program_revision error:", revErr);
      return errorResponse(req, "Erreur serveur", 500);
    }
    if (!revId) {
      // NULL = ineligible: not owned, already started, or a revision already in
      // flight (status generating). Refund the quota slot and reject.
      await supabaseAdmin.from("ai_generation_calls").delete().eq("id", rateRow.id);
      return errorResponse(
        req,
        "Révision impossible : ce programme est introuvable, déjà commencé, ou une révision est déjà en cours.",
        409,
      );
    }
    programId = revId as string;

    const { data: prev } = await supabaseAdmin
      .from("programs")
      .select("slug, generation_metadata")
      .eq("id", programId)
      .single();
    slug = (prev?.slug as string) ?? "";
    revisionContext = {
      comment: revisionComment,
      previousSummary: summarizePreviousProgram(prev?.generation_metadata),
    };
  } else {
    slug = `programme-${nanoid(10)}`;
    const provisionalTitle = locale === "en" ? "Program in preparation" : "Programme en préparation";
    const { data: newId, error: placeholderError } = await supabaseAdmin.rpc("create_program_placeholder", {
      p_user_id: user.id,
      p_slug: slug,
      p_title: provisionalTitle,
      p_goals: body.objectifs,
      p_duration_weeks: body.duree_semaines,
      p_frequency_per_week: body.seances_par_semaine,
      // Strip age/sexe before persistence — RGPD art. 5(1)(c) minimization.
      p_onboarding_data: sanitizeOnboardingForPersistence(body),
      p_locale: locale,
    });
    if (placeholderError || !newId) {
      // No generation started, so refund the rate-limit slot taken above.
      await supabaseAdmin.from("ai_generation_calls").delete().eq("id", rateRow.id);
      // The cap trigger (migration 027) raises 'active_programs_cap_reached' if
      // a race slipped past the pre-flight count. Surface the same message.
      if (placeholderError?.message?.includes(TRIGGER_CAP_REACHED)) {
        return errorResponse(
          req,
          `Limite atteinte : ${MAX_ACTIVE_PROGRAMS} programmes actifs maximum. Supprime un programme existant pour en creer un nouveau.`,
          429,
        );
      }
      console.error("Placeholder creation failed:", placeholderError);
      return errorResponse(req, "Erreur de création du programme", 500);
    }
    programId = newId as string;
  }

  const userPrompt = buildUserPrompt({ ...body, locale }, imposedStructure, revisionContext);

  // ── Background generation ────────────────────────────────────────────────
  // MUST carry its own try/catch: an unhandled rejection inside waitUntil is
  // silent and would leave the row stuck in 'generating'. On ANY failure we
  // flip the row to 'failed' with an honest reason (the client shows a retry).
  //
  // IMPORTANT: claude-sonnet-4-6 does NOT support assistant message prefill, so
  // the conversation must end with a user message (prefill is ""). The JSON-only
  // output is enforced by the system prompt + the retry-on-parse in the helper.
  const niveauMap: Record<string, string> = {
    debutant: "beginner",
    intermediaire: "intermediate",
    avance: "advanced",
  };

  async function failProgram(reason: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc("fail_program", {
      p_program_id: programId,
      p_user_id: user.id,
      p_error: reason,
    });
    if (error) console.error("fail_program RPC error:", error);
  }

  async function runGeneration(): Promise<void> {
    // Timeouts must fit the 400s wall-clock ceiling: we allow AT MOST ONE retry
    // across the parse and validation paths (each retry is a full re-generation),
    // so worst case = first (220s) + one retry (160s) = 380s < 400s. Beyond
    // that the isolate is killed and the row would be stuck 'generating'.
    const FIRST_TIMEOUT = 220_000;
    const RETRY_TIMEOUT = 160_000;
    let retriesLeft = 1;

    function callAnthropic(extraMessages: { role: string; content: string }[] = [], timeoutMs = FIRST_TIMEOUT) {
      return callAnthropicJson({
        apiKey: anthropicApiKey!,
        model: MODEL,
        maxTokens: MAX_TOKENS,
        systemPrompt,
        prefill: "",
        timeoutMs,
        messages: [{ role: "user", content: userPrompt }, ...extraMessages],
      });
    }

    try {
      // First attempt. A parse failure (model breaking the forced-JSON format)
      // is transient; spend our one retry on a fresh call. API/network/timeout
      // errors propagate to the catch → fail_program.
      let result!: Awaited<ReturnType<typeof callAnthropic>>;
      try {
        result = await callAnthropic();
      } catch (err) {
        if (err instanceof AnthropicCallError && err.kind === "parse" && retriesLeft > 0) {
          retriesLeft--;
          console.error("Parse failure on first attempt — retrying once");
          result = await callAnthropic([], RETRY_TIMEOUT);
        } else {
          throw err;
        }
      }
      let programJson: unknown = result.data;
      let totalInputTokens = result.inputTokens;
      let totalOutputTokens = result.outputTokens;

      let validation = validateProgram(programJson, body.duree_semaines, body.seances_par_semaine);
      if (!validation.valid && retriesLeft > 0) {
        retriesLeft--;
        console.error("First attempt validation failed:", validation.error);
        // A multi-turn assistant turn here is a normal conversation turn (NOT
        // an unfinished-prefill turn, which sonnet rejects), so it's allowed.
        const truncatedPrev = JSON.stringify(programJson).slice(0, 2000);
        const retryResult = await callAnthropic(
          [
            { role: "assistant", content: truncatedPrev },
            { role: "user", content: `Ta reponse precedente etait invalide: ${validation.error}. Corrige et renvoie le JSON complet.` },
          ],
          RETRY_TIMEOUT,
        );
        programJson = retryResult.data;
        totalInputTokens += retryResult.inputTokens;
        totalOutputTokens += retryResult.outputTokens;
        validation = validateProgram(programJson, body.duree_semaines, body.seances_par_semaine);
      }
      if (!validation.valid) {
        console.error("Validation failed after retry budget:", validation.error);
        await failProgram("Le programme généré est invalide. Réessaie.");
        return;
      }

      const pgm = programJson as Record<string, unknown>;
      const sessions = pgm.sessions as Record<string, Record<string, unknown>>;
      const calendrier = pgm.calendrier as CalendrierEntry[];

      // Observability (non-fatal): orphan sessions + imposed-structure drift.
      const referencedIds = new Set(calendrier.flatMap((e) => e.sequence));
      const orphanIds = Object.keys(sessions).filter((id) => !referencedIds.has(id));
      if (orphanIds.length > 0) {
        console.warn(`Orphan sessions declared but never scheduled: ${orphanIds.join(", ")}`);
      }
      if (imposedStructure === "phase" && pgm.structure !== "phase") {
        console.warn(`Imposed structure "phase" but model returned "${String(pgm.structure)}"`);
      }

      // Unroll the calendrier into one program_sessions row per (week, slot).
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
              console.error("Missing session data for id:", sessionId);
              await failProgram("Erreur de génération (sessions invalides)");
              return;
            }
            sessionRows.push({ week_number: week, session_order: globalOrder, session_data: sessionData });
            globalOrder++;
          }
        }
      }

      // Fill the placeholder + insert its sessions atomically, flip to 'ready'.
      const { error: finalizeError } = await supabaseAdmin.rpc("finalize_program", {
        p_program_id: programId,
        p_user_id: user.id,
        p_program: {
          title: pgm.titre,
          description: pgm.description,
          goals: body.objectifs,
          duration_weeks: body.duree_semaines,
          frequency_per_week: body.seances_par_semaine,
          fitness_level: niveauMap[pgm.niveau as string] ?? "intermediate",
          note_coach: pgm.note_coach,
          progression: pgm.progression,
          consignes_semaine: pgm.consignes_semaine,
          generation_metadata: pgm,
          input_tokens: totalInputTokens,
          output_tokens: totalOutputTokens,
          model: MODEL,
        },
        p_sessions: sessionRows,
      });

      if (finalizeError) {
        console.error("finalize_program RPC error:", finalizeError);
        await failProgram("Erreur de sauvegarde du programme");
        return;
      }

      console.log(`Program ${programId} ready (${sessionRows.length} sessions, ${totalOutputTokens} out tokens)`);
    } catch (err) {
      // Turn any Anthropic/parse/timeout/truncation failure into an honest,
      // user-facing reason stored on the row for the client to display.
      const { message } = describeAnthropicError(err, "programme");
      console.error("Background generation failed:", err);
      await failProgram(message);
    }
  }

  // Start the promise BEFORE returning, then hand it to waitUntil.
  const task = runGeneration();
  EdgeRuntime.waitUntil(task);

  return jsonResponse(req, { programId, slug, status: "generating" }, 202);
});
