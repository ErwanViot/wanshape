// Shared Anthropic call-failure taxonomy for the AI edge functions
// (generate-session, generate-program).
//
// Before this module, every distinct failure of a single Anthropic call —
// the model breaking out of the forced-JSON format, a 429 rate limit, a 401
// bad key, an exhausted credit balance, a request timeout — was collapsed
// into one opaque `502 "Erreur de communication avec l'IA"`. That made
// production incidents impossible to triage from the client and gave the user
// no actionable signal. We carry the kind + upstream HTTP status so callers
// can (a) surface an honest message and (b) decide whether a retry can help.

export type AnthropicErrorKind = "api" | "parse" | "timeout" | "network" | "truncation";

export class AnthropicCallError extends Error {
  kind: AnthropicErrorKind;
  /** Upstream HTTP status, only set when kind === "api". */
  status?: number;
  /** Truncated upstream detail for server logs (never shown to the user). */
  detail?: string;
  constructor(kind: AnthropicErrorKind, message: string, status?: number, detail?: string) {
    super(message);
    this.name = "AnthropicCallError";
    this.kind = kind;
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Perform one Anthropic Messages API call and return the parsed JSON payload.
 * Throws a typed {@link AnthropicCallError} for every failure mode so the
 * caller can map it precisely. The assistant prefill is prepended back before
 * parsing (Anthropic returns only the continuation when the assistant turn is
 * prefilled).
 */
export async function callAnthropicJson(opts: {
  apiKey: string;
  model: string;
  maxTokens: number;
  systemPrompt: string;
  messages: { role: string; content: string }[];
  prefill: string;
  timeoutMs: number;
}): Promise<{ data: unknown; inputTokens: number; outputTokens: number }> {
  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        system: [
          { type: "text", text: opts.systemPrompt, cache_control: { type: "ephemeral" } },
        ],
        messages: opts.messages,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs),
    });
  } catch (fetchErr) {
    const isTimeout = fetchErr instanceof DOMException && fetchErr.name === "TimeoutError";
    console.error("Anthropic fetch failed:", isTimeout ? "timeout" : String(fetchErr));
    throw new AnthropicCallError(
      isTimeout ? "timeout" : "network",
      isTimeout ? "Anthropic request timed out" : "Anthropic fetch failed",
    );
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    console.error("Anthropic API error:", res.status, errText);
    throw new AnthropicCallError("api", "Anthropic API error", res.status, errText.slice(0, 500));
  }

  const aiData = await res.json();

  // Truncation guard: if the model hit the token ceiling, `content` is a
  // syntactically broken JSON fragment. Detecting it here (via stop_reason)
  // gives callers a distinct, honest signal instead of a misleading "parse"
  // error that would trigger a same-shape retry doomed to truncate again.
  if (aiData.stop_reason === "max_tokens") {
    console.error("Anthropic response truncated: stop_reason=max_tokens");
    throw new AnthropicCallError("truncation", "Anthropic response truncated (max_tokens)");
  }

  const rawContent = aiData.content?.[0]?.text ?? "";
  const combined = `${opts.prefill}${rawContent}`;
  const cleaned = combined
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // The model occasionally breaks out of the prefill and emits prose or a
    // refusal wrapper instead of clean JSON. Transient — callers retry once.
    console.error("Failed to parse AI response:", combined.slice(0, 500));
    throw new AnthropicCallError("parse", "Failed to parse AI response", undefined, combined.slice(0, 200));
  }

  return {
    data: parsed,
    inputTokens: aiData.usage?.input_tokens ?? 0,
    outputTokens: aiData.usage?.output_tokens ?? 0,
  };
}

/**
 * Translate an Anthropic call failure into an honest user-facing message and
 * an HTTP status the client can act on. Pure (no Response building) so each
 * function can wrap it with its own CORS-aware errorResponse helper.
 *
 * `noun` lets the message name what failed ("séance" / "programme").
 */
/**
 * Stable machine code for a call failure, persisted in programs.error_reason
 * and localised client-side (src/utils/programErrors.ts). Keep the code list in
 * sync with PROGRAM_ERROR_CODES there.
 */
export type AnthropicErrorCode =
  | "timeout"
  | "parse"
  | "truncation"
  | "network"
  | "api_overloaded"
  | "api_unavailable"
  | "api_auth"
  | "api_rejected"
  | "api_error"
  | "unexpected";

export function anthropicErrorCode(err: unknown): AnthropicErrorCode {
  if (!(err instanceof AnthropicCallError)) return "unexpected";
  if (err.kind !== "api") return err.kind;
  const s = err.status ?? 0;
  if (s === 429) return "api_overloaded";
  if (s === 529 || s === 503) return "api_unavailable";
  if (s === 401 || s === 403) return "api_auth";
  if (s === 400) return "api_rejected";
  return "api_error";
}

export function describeAnthropicError(err: unknown, noun = "contenu"): { message: string; status: number } {
  if (err instanceof AnthropicCallError) {
    if (err.kind === "timeout") {
      return { message: "La génération a pris trop de temps. Réessaie dans un instant.", status: 504 };
    }
    if (err.kind === "parse") {
      return { message: `L'IA n'a pas réussi à produire un ${noun} exploitable. Réessaie.`, status: 422 };
    }
    if (err.kind === "truncation") {
      return { message: `Le ${noun} généré était trop volumineux et a été coupé. Réessaie.`, status: 422 };
    }
    if (err.kind === "network") {
      return { message: "Impossible de joindre le service IA. Vérifie ta connexion et réessaie.", status: 502 };
    }
    // kind === "api"
    const s = err.status ?? 0;
    if (s === 429) {
      return { message: "Le service IA est momentanément surchargé. Réessaie dans quelques instants.", status: 429 };
    }
    if (s === 529 || s === 503) {
      return { message: "Le service IA est temporairement indisponible. Réessaie dans un instant.", status: 503 };
    }
    if (s === 401 || s === 403) {
      return {
        message:
          "Le service IA a refusé l'authentification. C'est un problème de configuration côté serveur — contacte le support.",
        status: 502,
      };
    }
    if (s === 400) {
      return {
        message:
          "Le service IA a rejeté la requête (quota épuisé ou configuration). Si cela persiste, contacte le support.",
        status: 502,
      };
    }
    return {
      message: `Le service IA a renvoyé une erreur (${s}). Réessaie ou contacte le support si cela persiste.`,
      status: 502,
    };
  }
  return { message: "Erreur inattendue lors de la communication avec l'IA. Réessaie.", status: 502 };
}
