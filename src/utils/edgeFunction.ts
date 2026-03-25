/**
 * Extract a user-facing error message from a Supabase Edge Function error response.
 *
 * Edge Functions may embed the real error in `fnError.context` (a Response object)
 * or in a `data.error` field. This helper standardises extraction across hooks.
 */
export async function extractEdgeFunctionError(
  fnError: Record<string, unknown>,
  fallbackMessage: string,
): Promise<string> {
  try {
    const ctx = fnError.context;
    if (ctx && typeof (ctx as Response).json === 'function') {
      const body = await (ctx as Response).json();
      if (body?.error && typeof body.error === 'string') {
        return body.error;
      }
    }
  } catch {
    // Ignore parsing errors, keep fallback message
  }
  return fallbackMessage;
}
