import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";

const REFRESH_COOKIE = "refreshToken";
const SALT_ROUNDS = 10;

/** When frontend and API are on different sites, set REFRESH_COOKIE_SAMESITE=none (requires HTTPS). */
function refreshCookieFlags() {
  const sameSite =
    process.env.REFRESH_COOKIE_SAMESITE === "none" ? "none" : "lax";
  const secure =
    sameSite === "none" || process.env.NODE_ENV === "production";
  return { sameSite, secure };
}

function cookieOptions() {
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const { sameSite, secure } = refreshCookieFlags();
  return {
    httpOnly: true,
    sameSite,
    secure,
    maxAge,
    path: "/",
  };
}

export function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
}

export function clearRefreshCookie(res) {
  const { sameSite, secure } = refreshCookieFlags();
  res.clearCookie(REFRESH_COOKIE, { path: "/", sameSite, secure });
}

export async function persistRefreshToken(userId, rawRefresh) {
  const refreshTokenHash = await bcrypt.hash(rawRefresh, SALT_ROUNDS);
  await User.findByIdAndUpdate(userId, { refreshTokenHash });
}

export async function clearStoredRefreshToken(userId) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: "" });
}

export async function verifyStoredRefresh(userId, rawRefresh) {
  const user = await User.findById(userId).select("+refreshTokenHash");
  if (!user?.refreshTokenHash) return false;
  return bcrypt.compare(rawRefresh, user.refreshTokenHash);
}

export async function issueTokens(userId) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await persistRefreshToken(userId, refreshToken);
  return { accessToken, refreshToken };
}
