import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { sendOk } from "../utils/response.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import {
  issueTokens,
  setRefreshCookie,
  clearRefreshCookie,
  verifyStoredRefresh,
  clearStoredRefreshToken,
} from "../services/authTokens.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const SALT = 10;

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, SALT);
  const user = await User.create({ username, email, passwordHash });
  const { accessToken, refreshToken } = await issueTokens(user._id);
  setRefreshCookie(res, refreshToken);
  sendOk(res, {
    user: user.toJSON(),
    accessToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password", 401);
  }
  const safe = user.toJSON();
  delete safe.passwordHash;
  const { accessToken, refreshToken } = await issueTokens(user._id);
  setRefreshCookie(res, refreshToken);
  sendOk(res, { user: safe, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refreshToken;
  if (!raw) {
    throw new AppError("Unauthorized", 401);
  }
  let payload;
  try {
    payload = verifyRefreshToken(raw);
  } catch {
    clearRefreshCookie(res);
    throw new AppError("Unauthorized", 401);
  }
  if (payload.typ !== "refresh") {
    throw new AppError("Unauthorized", 401);
  }
  const ok = await verifyStoredRefresh(payload.sub, raw);
  if (!ok) {
    clearRefreshCookie(res);
    throw new AppError("Unauthorized", 401);
  }
  const { accessToken, refreshToken } = await issueTokens(payload.sub);
  setRefreshCookie(res, refreshToken);
  sendOk(res, { accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);

  let uid = req.userId;
  if (!uid) {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      try {
        const payload = verifyRefreshToken(raw);
        if (payload.typ === "refresh") {
          uid = payload.sub;
        }
      } catch {
        /* invalid cookie — already cleared */
      }
    }
  }

  if (uid) {
    await clearStoredRefreshToken(uid);
  }
  sendOk(res, { ok: true });
});
