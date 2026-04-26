import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  buildOverflowUserPrompt,
  buildTextUserPrompt,
  OVERFLOW_SYSTEM_PROMPT,
  type OverflowContext,
  TEXT_SYSTEM_PROMPT,
} from "./prompts.ts";
import { validateOverflowInsight, validateTextEstimate } from "./validate.ts";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS_TEXT = 512;
const MAX_TOKENS_OVERFLOW = 1024;
const TEXT_DAILY_LIMIT = 30;
const OVERFLOW_DAILY_LIMIT = 1;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

type Mode = "text" | "overflow";
const VALID_MODES: Mode[] = ["text", "overflow"];

interface RequestBody {
  mode?: string;
  description?: string;
  loggedDate?: string;
  localHourOfDay?: number;
}

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

function todayYYYYMMDD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

async function callAnthropic(
  anthropicApiKey: string,
  system: string,
  user: string,
  maxTokens: number,
  assistantPrefill?: string,
): Promise<{ json: unknown; usage: { input: number | null; output: number | null } } | Response> {
  const messages: Array<{ role: string; content: string }> = [{ role: "user", content: user }];
  if (assistantPrefill) {
    // Prefilling the assistant turn with the start of the expected JSON forces
    // the model to complete structured output instead of interpreting
    // instructions embedded in `user`. Defense-in-depth against jailbreaks.
    messages.push({ role: "assistant", content: assistantPrefill });
  }

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
        max_tokens: maxTokens,
        system,
        messages,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erreur de communication avec l'IA" }), { status: 502 });
  }

  if (!aiResponse.ok) {
    const errText = await aiResponse.text().catch(() => "Unknown error");
    console.error("Anthropic API error:", aiResponse.status, errText);
    return new Response(JSON.stringify({ error: "Erreur de génération" }), { status: 502 });
  }

  const aiData = await aiResponse.json();
  const rawContent = aiData.content?.[0]?.text ?? "";
  // If we prefilled the assistant, Anthropic only returns the continuation.
  const combined = assistantPrefill ? `${assistantPrefill}${rawContent}` : rawContent;
  const cleaned = combined
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse AI response:", combined.slice(0, 500));
    return new Response(JSON.stringify({ error: "Réponse IA invalide, réessayez" }), { status: 502 });
  }

  return {
    json: parsed,
    usage: {
      input: aiData.usage?.input_tokens ?? null,
      output: aiData.usage?.output_tokens ?? null,
    },
  };
}

function isOffTopic(json: unknown): boolean {
  return (
    json != null &&
    typeof json === "object" &&
    (json as Record<string, unknown>).error === "off_topic"
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  if (req.method !== "POST") {
    return errorResponse(req, "Method not allowed", 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errorResponse(req, "Missing authorization", 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicApiKey) return errorResponse(req, "Erreur de configuration serveur", 500);

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();
  if (authError || !user) return errorResponse(req, "Non autorisé", 401);

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  if (profile?.subscription_tier !== "premium") {
    return errorResponse(req, "Abonnement Premium requis", 403);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, "JSON invalide");
  }

  const mode = body.mode as Mode;
  if (!mode || !VALID_MODES.includes(mode)) {
    return errorResponse(req, "mode invalide");
  }

  const loggedDate = body.loggedDate && /^\d{8}$/.test(body.loggedDate) ? body.loggedDate : todayYYYYMMDD();
  const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  if (mode === "text") {
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!description) return errorResponse(req, "description manquante");
    if (description.length > 1000) return errorResponse(req, "description: 1000 caractères max");

    // Atomic rate-limit: insert a tracking row first, then count. If we end up
    // over the quota we delete the just-inserted row and reject. This closes
    // the race window of "count-then-insert" where parallel calls all observed
    // a pre-increment count.
    const { data: trackRow, error: trackInsertErr } = await supabaseAdmin
      .from("ai_text_calls")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (trackInsertErr || !trackRow) return errorResponse(req, "Erreur serveur", 500);

    const { count: textCount, error: textCountErr } = await supabaseAdmin
      .from("ai_text_calls")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", sinceIso);
    if (textCountErr) {
      await supabaseAdmin.from("ai_text_calls").delete().eq("id", trackRow.id);
      return errorResponse(req, "Erreur serveur", 500);
    }
    if ((textCount ?? 0) > TEXT_DAILY_LIMIT) {
      await supabaseAdmin.from("ai_text_calls").delete().eq("id", trackRow.id);
      return errorResponse(req, `Limite atteinte : ${TEXT_DAILY_LIMIT} estimations IA par 24h.`, 429);
    }

    const prompt = buildTextUserPrompt(description);
    const aiResult = await callAnthropic(
      anthropicApiKey,
      TEXT_SYSTEM_PROMPT,
      prompt,
      MAX_TOKENS_TEXT,
      '{"name":"',
    );
    if (aiResult instanceof Response) {
      const text = await aiResult.text();
      return jsonResponse(req, JSON.parse(text), aiResult.status);
    }
    if (isOffTopic(aiResult.json)) {
      return errorResponse(req, "Cette description ne semble pas correspondre à un repas.", 422);
    }
    const validation = validateTextEstimate(aiResult.json);
    if (!validation.ok) {
      console.error("Text estimate validation failed:", validation.error);
      return errorResponse(req, "Réponse IA invalide, réessayez", 502);
    }

    return jsonResponse(req, {
      estimate: validation.value,
      usage: { model: MODEL, input_tokens: aiResult.usage.input, output_tokens: aiResult.usage.output },
      loggedDate,
    });
  }

  // mode === 'overflow'
  // Atomic rate limit: insert a tracker row first, then count. Same pattern
  // as text mode (ai_text_calls) and as generate-session/program. Closes
  // the parallel-request race that previously let two simultaneous overflow
  // analyses fire two Anthropic calls before only one upserted.
  const { data: overflowRateRow, error: overflowRateInsertErr } = await supabaseAdmin
    .from("ai_generation_calls")
    .insert({ user_id: user.id, kind: "overflow" })
    .select("id")
    .single();
  if (overflowRateInsertErr || !overflowRateRow) return errorResponse(req, "Erreur serveur", 500);

  const { count, error: countError } = await supabaseAdmin
    .from("ai_generation_calls")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("kind", "overflow")
    .gte("created_at", sinceIso);
  if (countError) {
    await supabaseAdmin.from("ai_generation_calls").delete().eq("id", overflowRateRow.id);
    return errorResponse(req, "Erreur serveur", 500);
  }
  if ((count ?? 0) > OVERFLOW_DAILY_LIMIT) {
    await supabaseAdmin.from("ai_generation_calls").delete().eq("id", overflowRateRow.id);
    return errorResponse(req, "Tu as déjà ton analyse du jour. Reviens demain.", 429);
  }
  // Note: overflowRateRow is intentionally NOT deleted on downstream failures
  // (AI call, validation). A failed attempt still counts against the 24h
  // quota — same anti-retry-storm policy as the other AI endpoints.

  const [{ data: logsData, error: logsErr }, { data: profileData, error: profileErr }] = await Promise.all([
    supabaseAdmin
      .from("meal_logs")
      .select("meal_type,name,calories,protein_g,carbs_g,fat_g")
      .eq("user_id", user.id)
      .eq("logged_date", loggedDate),
    supabaseAdmin
      .from("nutrition_profiles")
      .select("target_calories,target_protein_g,target_carbs_g,target_fat_g")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (logsErr || profileErr) return errorResponse(req, "Erreur serveur", 500);

  const logs = (logsData ?? []) as Array<{
    meal_type: string;
    name: string;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }>;

  const total = logs.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein_g: acc.protein_g + (m.protein_g ?? 0),
      carbs_g: acc.carbs_g + (m.carbs_g ?? 0),
      fat_g: acc.fat_g + (m.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );

  const localHourRaw = body.localHourOfDay;
  const localHour =
    typeof localHourRaw === "number" && Number.isFinite(localHourRaw) ? localHourRaw : new Date().getHours();

  const ctx: OverflowContext = {
    targetCalories: profileData?.target_calories ?? null,
    targetProteinG: profileData?.target_protein_g ?? null,
    targetCarbsG: profileData?.target_carbs_g ?? null,
    targetFatG: profileData?.target_fat_g ?? null,
    totalCalories: total.calories,
    totalProteinG: total.protein_g,
    totalCarbsG: total.carbs_g,
    totalFatG: total.fat_g,
    meals: logs.map((m) => ({ meal_type: m.meal_type, name: m.name, calories: m.calories ?? 0 })),
    localHourOfDay: Math.max(0, Math.min(23, Math.round(localHour))),
  };

  const prompt = buildOverflowUserPrompt(ctx);
  const aiResult = await callAnthropic(anthropicApiKey, OVERFLOW_SYSTEM_PROMPT, prompt, MAX_TOKENS_OVERFLOW);
  if (aiResult instanceof Response) {
    const text = await aiResult.text();
    return jsonResponse(req, JSON.parse(text), aiResult.status);
  }
  if (isOffTopic(aiResult.json)) {
    return errorResponse(req, "Pas assez de données pour une analyse aujourd'hui.", 422);
  }
  const validation = validateOverflowInsight(aiResult.json);
  if (!validation.ok) {
    console.error("Overflow validation failed:", validation.error);
    return errorResponse(req, "Réponse IA invalide, réessayez", 502);
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("nutrition_insights")
    .upsert(
      {
        user_id: user.id,
        logged_date: loggedDate,
        summary: validation.value.summary,
        suggestions: validation.value.suggestions,
        ai_metadata: {
          model: MODEL,
          input_tokens: aiResult.usage.input,
          output_tokens: aiResult.usage.output,
        },
      },
      { onConflict: "user_id,logged_date" },
    )
    .select()
    .single();

  if (insertError || !inserted) {
    console.error("Insert insight error:", insertError);
    return errorResponse(req, "Erreur de sauvegarde", 500);
  }

  return jsonResponse(req, { insight: inserted, loggedDate });
});
