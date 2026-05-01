// FIXED: updated API URL
const requiredOrigins = [
  "https://social-7mhqjqndp-lithvinskys-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

const extraOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...requiredOrigins, ...extraOrigins]);

function isAllowedHostedOrigin(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "https:") return false;
    // Allow Vercel preview + production domains for this app.
    if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) {
      return true;
    }
    // Allow Render-hosted web origins when needed.
    if (hostname === "onrender.com" || hostname.endsWith(".onrender.com")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function corsOriginCallback(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.has(origin)) return callback(null, true);
  if (isAllowedHostedOrigin(origin)) return callback(null, true);
  return callback(null, false);
}

export const corsOptions = {
  origin: corsOriginCallback,
  credentials: true,
};
