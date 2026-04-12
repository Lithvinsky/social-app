import { Router } from "express";
import * as ctrl from "../controllers/postsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateParams } from "../middleware/validate.js";
import { commentIdParamSchema } from "../validation/schemas.js";

const r = Router();

r.delete(
  "/:commentId",
  requireAuth,
  validateParams(commentIdParamSchema),
  ctrl.deleteComment
);

export default r;
