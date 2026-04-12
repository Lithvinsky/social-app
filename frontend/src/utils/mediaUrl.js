/**
 * Turn stored post `media[].url` into a browser-loadable URL.
 * - Cloudinary: already absolute https
 * - Local files in DB as `/uploads/...`:
 *   - With `VITE_API_BASE` (http…): `${base}/uploads/...`
 *   - Otherwise: `/api/uploads/...` so Vite’s `/api` proxy rewrites to the API (same as JSON calls)
 */
export function resolveMediaUrl(url) {
  if (url == null || url === "") {
    return "";
  }
  const s = typeof url === "string" ? url.trim() : String(url);
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  const base = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  if (base && s.startsWith("/")) {
    return `${base}${s}`;
  }
  if (s.startsWith("/uploads/")) {
    return `/api${s}`;
  }
  return s;
}
