import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { sendErr } from "../utils/response.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return sendErr(res, "Validation failed", 422, err.flatten().fieldErrors);
  }
  if (err instanceof AppError) {
    return sendErr(res, err.message, err.statusCode, err.errors);
  }

  if (err.name === "ValidationError") {
    return sendErr(res, err.message, 400);
  }

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large"
        : err.message || "Upload failed";
    return sendErr(res, message, 400);
  }

  if (err.name === "CastError") {
    return sendErr(res, "Invalid id", 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return sendErr(res, `${field} already exists`, 409);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return sendErr(res, "Invalid or expired token", 401);
  }

  console.error(err);
  return sendErr(res, "Internal server error", 500);
}
