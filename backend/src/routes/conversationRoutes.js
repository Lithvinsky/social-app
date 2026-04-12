import { Router } from "express";
import * as ctrl from "../controllers/conversationsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createConversationSchema } from "../validation/schemas.js";

const r = Router();

r.get("/unread-count", requireAuth, ctrl.unreadMessageTotal);
r.get("/", requireAuth, ctrl.listConversations);
r.post(
  "/",
  requireAuth,
  validateBody(createConversationSchema),
  ctrl.createOrGetConversation
);

export default r;
