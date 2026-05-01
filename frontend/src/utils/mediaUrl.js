/**
 * Turn stored post `media[].url` into a browser-loadable URL.
 * - Cloudinary: already absolute https
 * - Local files in DB as `/uploads/...`:
 *   - With `VITE_API_URL`: `${base}/uploads/...`
 */
// FIXED: updated API base URL to correct Render backend
export function resolveMediaUrl(url) {
  if (url == null || url === "") {
    return "";
  }
  const s = typeof url === "string" ? url.trim() : String(url);
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  const base = (
    import.meta.env.VITE_API_URL || "https://social-app-5sgz.onrender.com"
  ).replace(/\/$/, "");
  if (base && s.startsWith("/")) {
    return `${base}${s}`;
  }
  return s;
}
