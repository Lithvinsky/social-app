/**
 * Shared CORS rules for Express and Socket.IO so browser + socket clients
 * work in dev and on common static/PaaS hosts (Vercel, Render, Netlify, Railway).
 *
 * In non-production, any http://localhost:* or http://127.0.0.1:* origin is allowed
 * (Vite may use 5174, 5175, preview on 4173, etc.).
 *
 * Set CLIENT_ORIGIN to your frontend URL(s), comma-separated, e.g.:
 * CLIENT_ORIGIN=https://myapp.vercel.app,https://myapp.onrender.com
 */

const defaultOrigins = [
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const extraOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [...defaultOrigins, ...extraOrigins];

function isVercelHost(hostname) {
  return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
}

function isTrustedDeployHost(hostname) {
  if (isVercelHost(hostname)) return true;
  if (hostname === "onrender.com" || hostname.endsWith(".onrender.com"))
    return true;
  if (hostname === "netlify.app" || hostname.endsWith(".netlify.app"))
    return true;
  if (hostname === "railway.app" || hostname.endsWith(".railway.app"))
    return true;
  return false;
}

function isLocalDevHttpOrigin(origin) {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const u = new URL(origin);
    return (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function corsOriginCallback(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  if (isLocalDevHttpOrigin(origin)) return callback(null, true);
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol === "https:" && isTrustedDeployHost(hostname)) {
      return callback(null, true);
    }
  } catch {
    /* ignore */
  }
  callback(null, false);
}

export const corsOptions = {
  origin: corsOriginCallback,
  credentials: true,
};
