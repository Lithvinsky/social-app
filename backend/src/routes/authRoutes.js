import { Router } from "express";
import * as ctrl from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validation/schemas.js";
import { optionalAuth } from "../middleware/auth.js";

const r = Router();

r.post("/register", validateBody(registerSchema), ctrl.register);
r.post("/login", validateBody(loginSchema), ctrl.login);
r.post("/refresh", ctrl.refresh);
/** Clears refresh cookie always; revokes server refresh when user id comes from Bearer or valid refresh cookie. */
r.post("/logout", optionalAuth, ctrl.logout);

export default r;
