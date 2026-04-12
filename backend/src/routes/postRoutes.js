import { Router } from "express";
import * as ctrl from "../controllers/postsController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validate.js";
import {
  paginationSchema,
  createPostSchema,
  commentBodySchema,
  postIdParamSchema,
} from "../validation/schemas.js";

const r = Router();

r.post(
  "/",
  requireAuth,
  validateBody(createPostSchema),
  ctrl.createPost
);

r.get(
  "/feed",
  requireAuth,
  validateQuery(paginationSchema),
  ctrl.feed
);

r.get(
  "/:id/comments",
  requireAuth,
  validateParams(postIdParamSchema),
  validateQuery(paginationSchema),
  ctrl.listComments
);

r.get("/:id", requireAuth, validateParams(postIdParamSchema), ctrl.getPost);

r.delete(
  "/:id",
  requireAuth,
  validateParams(postIdParamSchema),
  ctrl.deletePost
);

r.post(
  "/:id/like",
  requireAuth,
  validateParams(postIdParamSchema),
  ctrl.likePost
);

r.post(
  "/:id/comment",
  requireAuth,
  validateParams(postIdParamSchema),
  validateBody(commentBodySchema),
  ctrl.addComment
);

export default r;
