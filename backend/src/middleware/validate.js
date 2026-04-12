import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

export function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(
          new AppError("Validation failed", 422, e.flatten().fieldErrors)
        );
      }
      next(e);
    }
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(
          new AppError("Validation failed", 422, e.flatten().fieldErrors)
        );
      }
      next(e);
    }
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(
          new AppError("Validation failed", 422, e.flatten().fieldErrors)
        );
      }
      next(e);
    }
  };
}
