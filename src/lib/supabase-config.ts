const hasValue = (value: unknown) => typeof value === "string" && value.trim().length > 0;

export function isSupabaseConfigured() {
  return hasValue(import.meta.env.VITE_SUPABASE_URL) && hasValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
}

export function getAuthUnavailableMessage() {
  return "Authentication is unavailable right now. Please try again shortly.";
}