import { StrictRouter } from "../utils/strictRouter.ts";
import {
  register,
  login,
  logout,
  adminOnly,
} from "../controllers/authController.ts";
import {
  localAuth,
  isAuthenticated,
  isPublic,
  lateAuth,
} from "../middlewares/authMiddleware.ts";
import { validate, noValidation } from "../middlewares/validateMiddleware.ts";
import { registerSchema, loginSchema } from "shared";

const router = StrictRouter();

router.post(
  "/register",
  isPublic,
  validate({ body: registerSchema }),
  register,
);
router.post(
  "/login",
  validate({ body: loginSchema }),
  lateAuth(localAuth),
  login,
);
router.post("/logout", isAuthenticated, noValidation, logout);

// A01:2025 Broken Access Control - Admin role is not enforced.
// the fix: router.get('/admin-only', requireRole('admin'), noValidation, adminOnly);
router.get("/admin-only", isPublic, noValidation, adminOnly);

export default router;
