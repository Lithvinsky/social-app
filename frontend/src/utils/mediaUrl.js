import { resolveApiOrigin } from "./apiOrigin.js";

/**
 * Resolve a stored URL for feed/post `media[]` (legacy) or similar absolute paths.
 * - Absolute `https://…` URLs pass through
 * - Paths like `/uploads/...` get the API origin prefixed when needed
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
