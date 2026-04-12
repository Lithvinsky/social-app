import { Router } from "express";
import * as ctrl from "../controllers/messagesController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validate.js";
import {
  conversationIdParamSchema,
  createMessageSchema,
  paginationSchema,
} from "../validation/schemas.js";

const r = Router();

r.get(
  "/:conversationId",
  requireAuth,
  validateParams(conversationIdParamSchema),
  validateQuery(paginationSchema),
  ctrl.listMessages
);

r.post(
  "/",
  requireAuth,
  validateBody(createMessageSchema),
  ctrl.sendMessage
);

export default r;
