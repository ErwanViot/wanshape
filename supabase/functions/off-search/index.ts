import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Server-side proxy to OFF's search-a-licious endpoint.
 *
 * Why this exists: search-a-licious is the only OFF service that does proper
 * relevance-ranked text search (Elasticsearch-backed), but its upstream
 * gateway (Cloudflare/WAF) blocks browser CORS preflights with `400
 * Disallowed CORS origin`, even from production domains. The plain
 * `/api/v2/search?search_terms=` endpoint is CORS-open but silently ignores
 * the search term and returns the unfiltered global product set.
 *
 * Design constraints:
 * - OFF rate-limits search to ~10 req/min per IP. Our edge function shares a
 *   small set of Supabase datacenter IPs across all our users, so caching is
 *   not optional — it is the difference between this working and getting our
 *   datacenter IP banned.
 * - OFF expects a User-Agent identifying the app + contact. Without it they
 *   may rate-limit or ban opaque clients.
 * - search-a-licious is still flagged beta in OFF docs; we pin to the field
 *   list we tested and pass through the response shape unmodified so client
 *   schema drift surfaces in one place.
 */

const OFF_SEARCH_URL = "https://search.openfoodfacts.org/search";
const USER_AGENT = "Wan2Fit/1.1.1 (erwan.viot@gmail.com https://wan2fit.fr)";

// Fields we forward to OFF. Locked down to what the client actually renders
// — sending an empty `fields` would let OFF return its 100+ field default
// payload, wasting bandwidth and risking schema drift.
const OFF_FIELDS = [
  "code",
  "product_name",
  "product_name_fr",
  "brands",
  "quantity",
  "product_quantity",
  "serving_size",
  "serving_quantity",
  "nutriments",
  "image_small_url",
].join(",");

const MAX_PAGE_SIZE = 24;
const MIN_QUERY_LEN = 2;
const MAX_QUERY_LEN = 100;
// 15 minutes is conservative: product nutrition data is essentially static
// on hour-scales, and OFF's own /api/v2 CDN advertises max-age=300 (5 min).
// Triple that budget to cut real-world OFF load — at our traffic the cache
// hit rate on common queries (nutella, coca-cola, activia) is what keeps us
// well below the 10 req/min/IP ceiling.
const CACHE_TTL_MS = 15 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 8000;

// In-process LRU-ish cache. Per-isolate, lost on cold start — that's fine
// at our scale; if cold-start bursts ever cause OFF rate-limit hits in
// production, migrate this to a Supabase `search_cache` table with a
// 30-min TTL (cached_at timestamp + a SELECT WHERE cached_at > NOW() - …
// guard). 200 entries × ~10 KB = ~2 MB, well within the isolate budget.
const CACHE_MAX_ENTRIES = 200;
type CacheEntry = { payload: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

// Lightweight global circuit breaker: if OFF starts returning 429/503
// repeatedly, stop hammering them and fail fast for ~60 s. Resets once we
// next get a 2xx response. Avoids escalating a transient OFF blip into a
// proper IP ban.
let upstreamFailures = 0;
let circuitOpenUntil = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 60_000;

function jsonResponse(req: Request, data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

function cacheKey(q: string, pageSize: number): string {
  return `${q}|${pageSize}`;
}

function readCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.payload;
}

function writeCache(key: string, payload: unknown): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // Naive eviction: drop the first (oldest insertion order) entry. Cheap
    // and good enough — this cache is a load-shedding device, not a data
    // store, so eviction quality is not a hot path.
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchUpstream(q: string, pageSize: number, signal: AbortSignal): Promise<Response> {
  const params = new URLSearchParams({
    q,
    fields: OFF_FIELDS,
    page_size: String(pageSize),
    langs: "fr",
  });
  return await fetch(`${OFF_SEARCH_URL}?${params}`, {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
}

interface RequestBody {
  q?: string;
  page_size?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  // POST matches the supabase-js `functions.invoke` default and the
  // surrounding edge function conventions. The body shape is the same
  // arguments we'd otherwise pass via query string.
  if (req.method !== "POST") {
    return errorResponse(req, "Method not allowed", 405);
  }

  // Auth: require a Supabase session token. The anon JWT is enough — it
  // proves the request came from our frontend session, which is sufficient
  // gating for a read-only proxy. We don't need verified-email or premium
  // checks here.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errorResponse(req, "Missing authorization", 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return errorResponse(req, "Server misconfigured", 500);

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();
  if (authError || !user) return errorResponse(req, "Non autorisé", 401);

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return errorResponse(req, "Invalid JSON body", 400);
  }

  const rawQ = typeof body.q === "string" ? body.q : "";
  const q = rawQ.trim().toLowerCase();
  if (q.length < MIN_QUERY_LEN) return errorResponse(req, "q too short", 400);
  if (q.length > MAX_QUERY_LEN) return errorResponse(req, "q too long", 400);

  const rawPageSize = typeof body.page_size === "number" ? body.page_size : 8;
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(Math.max(Math.floor(rawPageSize), 1), MAX_PAGE_SIZE)
    : 8;

  const key = cacheKey(q, pageSize);
  const cached = readCache(key);
  if (cached !== null) {
    return jsonResponse(req, cached, 200, { "X-Cache": "HIT" });
  }

  if (Date.now() < circuitOpenUntil) {
    return errorResponse(req, "Search temporarily unavailable", 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetchUpstream(q, pageSize, controller.signal);
  } catch (err) {
    clearTimeout(timeout);
    upstreamFailures++;
    if (upstreamFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
    }
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return errorResponse(req, aborted ? "Upstream timeout" : "Upstream unreachable", 502);
  }
  clearTimeout(timeout);

  if (!upstream.ok) {
    if (upstream.status === 429 || upstream.status === 503) {
      upstreamFailures++;
      if (upstreamFailures >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
      }
    }
    // Don't cache failures — try again on the next request.
    return errorResponse(req, `Upstream ${upstream.status}`, 502);
  }

  // 2xx — reset the breaker counter so transient blips don't accumulate.
  upstreamFailures = 0;

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return errorResponse(req, "Upstream returned non-JSON", 502);
  }

  writeCache(key, payload);
  return jsonResponse(req, payload, 200, { "X-Cache": "MISS" });
});
