// FIXED: updated API URL
const requiredOrigins = [
  "https://social-7mhqjqndp-lithvinskys-projects.vercel.app",
  "http://localhost:5173",
];

const extraOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...requiredOrigins, ...extraOrigins]);

export function corsOriginCallback(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.has(origin)) return callback(null, true);
  return callback(null, false);
}

export const corsOptions = {
  origin: corsOriginCallback,
  credentials: true,
};
