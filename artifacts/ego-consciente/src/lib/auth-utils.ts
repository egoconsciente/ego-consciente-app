/**
 * Returns the absolute URL Supabase should redirect to after email confirmation.
 * Uses window.location.origin so it works in dev (Replit preview) and production
 * without hard-coding any domain.
 *
 * import.meta.env.BASE_URL is injected by Vite from the BASE_PATH env var.
 * It always ends with '/' (e.g. '/ego-consciente/'), so concatenating
 * 'auth/callback' produces the correct full path.
 */
export function getAuthRedirectUrl(): string {
  const base = (import.meta.env.BASE_URL as string) ?? "/";
  return window.location.origin + base + "auth/callback";
}
