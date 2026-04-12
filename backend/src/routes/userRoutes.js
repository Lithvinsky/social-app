import { Router } from "express";
import * as ctrl from "../controllers/usersController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  idParamSchema,
  updateUserSchema,
  userSearchQuerySchema,
} from "../validation/schemas.js";
import { uploadAvatar } from "../utils/multer.js";

const r = Router();

r.get(
  "/search",
  requireAuth,
  validateQuery(userSearchQuerySchema),
  ctrl.searchUsers
);
r.get("/suggestions", requireAuth, ctrl.suggestions);

r.get("/:id", optionalAuth, validateParams(idParamSchema), ctrl.getUser);

r.put(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  uploadAvatar.single("avatar"),
  (req, _res, next) => {
    try {
      if (typeof req.body.bio === "string") {
        req.body = updateUserSchema.parse({
          bio: req.body.bio,
          avatar: req.body.avatar,
        });
      } else {
        req.body = updateUserSchema.parse(req.body || {});
      }
      next();
    } catch (e) {
      next(e);
    }
  },
  ctrl.updateUser
);

r.post(
  "/:id/follow",
  requireAuth,
  validateParams(idParamSchema),
  ctrl.follow
);
r.post(
  "/:id/unfollow",
  requireAuth,
  validateParams(idParamSchema),
  ctrl.unfollow
);

export default r;
