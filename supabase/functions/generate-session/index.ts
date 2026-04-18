import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.ts";
import { validateSession } from "./validate.ts";

const MAX_DAILY_GENERATIONS = 10;
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 4096;

const VALID_MODES = ["quick", "detailed", "expert"];
const VALID_PRESETS = ["transpirer", "renfo", "express", "mobilite"];
const VALID_EQUIPMENT = [
  "poids_du_corps",
  "halteres",
  "barre_disques",
  "kettlebell",
  "elastiques",
  "banc",
  "barre_traction",
  "trx",
  "corde_a_sauter",
  "medecine_ball",
  "swiss_ball",
  "tapis",
  "step",
  "foam_roller",
  "anneaux",
];
const VALID_INTENSITIES = ["douce", "moderee", "intense"];
const VALID_BODY_FOCUS = ["upper", "lower", "core", "full"];
const VALID_DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

interface RequestInput {
  mode: string;
  preset?: string;
  duration: number;
  equipment?: string[];
  intensity?: string;
  bodyFocus?: string[];
  preferences?: string;
  refinementNote?: string;
}

function validateInput(body: RequestInput): string | null {
  if (!body.mode || !VALID_MODES.includes(body.mode)) {
    return "mode invalide";
  }

  if (!body.duration || !VALID_DURATIONS.includes(body.duration)) {
    return "duration invalide (10-90 par pas de 5)";
  }

  if (body.mode === "quick") {
    if (!body.preset || !VALID_PRESETS.includes(body.preset)) {
      return "preset invalide pour le mode quick";
    }
  }

  if (body.mode === "detailed") {
    if (body.equipment) {
      if (!Array.isArray(body.equipment)) return "equipment doit être un tableau";
      for (const e of body.equipment) {
        if (!VALID_EQUIPMENT.includes(e)) return `equipment invalide: ${e}`;
      }
    }
    if (body.intensity && !VALID_INTENSITIES.includes(body.intensity)) {
      return "intensity invalide";
    }
    if (body.bodyFocus) {
      if (!Array.isArray(body.bodyFocus)) return "bodyFocus doit être un tableau";
      for (const f of body.bodyFocus) {
        if (!VALID_BODY_FOCUS.includes(f)) return `bodyFocus invalide: ${f}`;
      }
    }
    if (body.preferences && typeof body.preferences !== "string") {
      return "preferences doit être une chaîne";
    }
    if (body.preferences && body.preferences.length > 2000) {
      return "preferences: 2000 caractères max";
    }
  }

  if (body.mode === "expert") {
    if (!body.preferences || typeof body.preferences !== "string" || body.preferences.trim().length === 0) {
      return "preferences requis en mode expert";
    }
    if (body.preferences.length > 2000) {
      return "preferences: 2000 caractères max";
    }
  }

  if (body.refinementNote && typeof body.refinementNote !== "string") {
    return "refinementNote doit être une chaîne";
  }
  if (body.refinementNote && body.refinementNote.length > 300) {
    return "refinementNote: 300 caractères max";
  }

  return null;
}

function getTodayKey(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return errorResponse(req, "Method not allowed", 405);
  }

  // Auth
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

  // Create admin client for DB operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user JWT
  const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return errorResponse(req, "Non autorisé", 401);
  }

  // Check premium tier
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier !== "premium") {
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

  // Rate limit: max generations per 24h
  const { count, error: countError } = await supabaseAdmin
    .from("custom_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (countError) {
    return errorResponse(req, "Erreur serveur", 500);
  }

  if ((count ?? 0) >= MAX_DAILY_GENERATIONS) {
    return errorResponse(
      req,
      `Limite atteinte : ${MAX_DAILY_GENERATIONS} séances par 24h. Réessayez plus tard.`,
      429,
    );
  }

  // Build prompt
  const userPrompt = buildUserPrompt(body as Parameters<typeof buildUserPrompt>[0]);

  // Call Anthropic API
  let aiResponse: Response;
  try {
    aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return errorResponse(req, "Erreur de communication avec l'IA", 502);
  }

  if (!aiResponse.ok) {
    const errText = await aiResponse.text().catch(() => "Unknown error");
    console.error("Anthropic API error:", aiResponse.status, errText);
    return errorResponse(req, "Erreur de génération", 502);
  }

  const aiData = await aiResponse.json();

  // Extract token usage
  const inputTokens = aiData.usage?.input_tokens ?? null;
  const outputTokens = aiData.usage?.output_tokens ?? null;

  // Parse content
  const rawContent = aiData.content?.[0]?.text ?? "";
  let sessionJson: unknown;

  try {
    // Handle potential ```json wrapper
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    sessionJson = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse AI response:", rawContent.slice(0, 500));
    return errorResponse(req, "Réponse IA invalide, réessayez", 502);
  }

  // Check for off-topic
  if (
    sessionJson &&
    typeof sessionJson === "object" &&
    (sessionJson as Record<string, unknown>).error === "off_topic"
  ) {
    return errorResponse(
      req,
      "Cette demande ne concerne pas le fitness. Veuillez décrire un entraînement.",
      422,
    );
  }

  // Validate session structure
  const validation = validateSession(sessionJson, body.duration);
  if (!validation.valid) {
    console.error("Session validation failed:", validation.error);
    return errorResponse(req, "La séance générée est invalide, réessayez", 502);
  }

  // Set date to today (server-side)
  (sessionJson as Record<string, unknown>).date = getTodayKey();

  // Insert into database
  const { data: insertedRow, error: insertError } = await supabaseAdmin
    .from("custom_sessions")
    .insert({
      user_id: user.id,
      mode: body.mode,
      preset: body.preset ?? null,
      duration_minutes: body.duration,
      equipment: body.equipment ?? [],
      intensity: body.intensity ?? null,
      body_focus: body.bodyFocus ?? [],
      preferences: body.preferences ?? null,
      refinement_note: body.refinementNote ?? null,
      session_data: sessionJson,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model: MODEL,
    })
    .select("id")
    .single();

  if (insertError || !insertedRow) {
    console.error("Insert error:", insertError);
    return errorResponse(req, "Erreur de sauvegarde", 500);
  }

  return jsonResponse(req, {
    session: sessionJson,
    customSessionId: insertedRow.id,
  });
});
