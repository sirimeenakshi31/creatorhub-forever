// Server-only utilities: rate limiting, model allowlists, system prompts.
import { TOOLS } from "./tools";

const buckets = new Map<string, { count: number; reset: number }>();

export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

/** Returns null if allowed, or a Response if the caller is rate-limited. */
export function rateLimit(
  request: Request,
  key: string,
  limit: number,
  windowMs: number,
): Response | null {
  const ip = getClientIp(request);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = buckets.get(bucketKey);
  if (!entry || entry.reset < now) {
    buckets.set(bucketKey, { count: 1, reset: now + windowMs });
    return null;
  }
  if (entry.count >= limit) {
    const retry = Math.max(1, Math.ceil((entry.reset - now) / 1000));
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded — please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retry),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
  entry.count += 1;
  return null;
}

// Allowlisted models — never trust client-supplied model identifiers.
export const TEXT_MODELS = new Set(["google/gemini-3-flash-preview"]);
export const IMAGE_MODELS = new Set(["google/gemini-2.5-flash-image"]);
export const DEFAULT_TEXT_MODEL = "google/gemini-3-flash-preview";
export const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image";

// System prompts for special non-text kinds (palette / fonts).
const EXTRA_SYSTEMS: Record<string, string> = {
  "color-palette":
    'You design beautiful color palettes. Return ONLY raw JSON (no markdown fences) shaped: {"palettes":[{"name":string,"colors":[6 hex strings starting with #]}]}. Generate 3 palettes matching the mood.',
  "font-pairing":
    'Suggest 4 Google Font pairings for a brand. Return ONLY raw JSON: {"pairs":[{"name":string,"heading":string (google font family name),"body":string,"reason":string}]}',
};

/** Resolve the server-side system prompt for a given tool slug. */
export function systemForSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  if (EXTRA_SYSTEMS[slug]) return EXTRA_SYSTEMS[slug];
  const tool = TOOLS.find((t) => t.slug === slug);
  return tool?.system;
}
