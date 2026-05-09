/**
 * Single place for “where is the API?” in the browser.
 * - Prefer VITE_API_URL, then VITE_API_BASE (legacy / README alias).
 * - In local dev, empty string means same-origin `/api` (Vite proxy → backend).
 * - Production builds without env fall back to the deployed API host.
 */
export function resolveApiOrigin() {
  const fromEnv =
    import.meta.env.VITE_API_URL?.trim() ||
    import.meta.env.VITE_API_BASE?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "https://social-app-5sgz.onrender.com".replace(/\/$/, "");
}
