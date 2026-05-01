import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";

import { corsOptions } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/errors.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  const uploadsAbs = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsAbs, { recursive: true });
  /** Before helmet so image responses stay simple (SPA loads images cross-origin in dev). */
  app.use(
    "/uploads",
    express.static(uploadsAbs, {
      maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
    }),
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  );

  app.use(cors(corsOptions));

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  const mountApiRoutes = (prefix = "") => {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/users`, userRoutes);
    app.use(`${prefix}/posts`, postRoutes);
    app.use(`${prefix}/comments`, commentRoutes);
    app.use(`${prefix}/conversations`, conversationRoutes);
    app.use(`${prefix}/messages`, messageRoutes);
    app.use(`${prefix}/notifications`, notificationRoutes);
  };

  // Support both direct backend paths and /api-prefixed frontend paths.
  mountApiRoutes("");
  mountApiRoutes("/api");

  app.use((_req, _res, next) => {
    next(new AppError("Not found", 404));
  });

  app.use(errorHandler);

  return app;
}
