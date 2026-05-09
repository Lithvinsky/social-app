import { resolveApiOrigin } from "./apiOrigin.js";

/**
 * Turn stored post `media[].url` into a browser-loadable URL.
 * - Cloudinary: already absolute https
 * - Local files in DB as `/uploads/...`:
 *   - With resolved API origin: `${base}/uploads/...`
 */
export function resolveMediaUrl(url) {
  if (url == null || url === "") {
    return "";
  }
  const s = typeof url === "string" ? url.trim() : String(url);
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  const base = resolveApiOrigin();
  if (base && s.startsWith("/")) {
    return `${base}${s}`;
  }
  return s;
}
