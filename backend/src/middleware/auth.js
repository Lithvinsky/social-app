import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import { User } from "../models/User.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    if (payload.typ !== "access") {
      throw new AppError("Unauthorized", 401);
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }
    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (e) {
    next(e.name === "AppError" ? e : new AppError("Unauthorized", 401));
  }
}

/** Attach user when Bearer token is valid; no error if missing. */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next();
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    if (payload.typ !== "access") return next();
    const user = await User.findById(payload.sub);
    if (user) {
      req.user = user;
      req.userId = user._id.toString();
    }
    next();
  } catch {
    next();
  }
}
