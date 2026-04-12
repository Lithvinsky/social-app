import { Router } from "express";
import * as ctrl from "../controllers/notificationsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { paginationSchema, notificationsReadSchema } from "../validation/schemas.js";

const r = Router();

r.get("/", requireAuth, validateQuery(paginationSchema), ctrl.listNotifications);
r.post(
  "/read",
  requireAuth,
  validateBody(notificationsReadSchema),
  ctrl.markRead
);

export default r;
