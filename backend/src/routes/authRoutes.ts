import { StrictRouter } from "../utils/strictRouter.ts";
import {
  register,
  login,
  logout,
  getAllUsers,
  searchUsers,
  forgotPassword,
  resetPassword,
  deleteAccount,
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

router.post("/register", isPublic, validate({ body: registerSchema }), register);

// Flaw 1:
// A07:2025 Authentication Failures - No rate limiting on login route
// the fix:
// import rateLimit from 'express-rate-limit';
// const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
// router.post("/login", loginLimiter, validate({ body: loginSchema }), lateAuth(localAuth), login);
router.post("/login", validate({ body: loginSchema }), lateAuth(localAuth), login);
router.post("/logout", isAuthenticated, noValidation, logout);

// Flaw 2:
// A01:2025 Broken Access Control - Admin role is not enforced.
// the fix: 
// import {isAdmin } from "../middlewares/authMiddleware.ts";
// router.get('/admin/users', isAuthenticated, isAdmin, noValidation, getAllUsers);
router.get("/admin/users", isAuthenticated, noValidation, getAllUsers);

router.get("/search", isPublic, noValidation, searchUsers);
router.post("/forgot-password", isPublic, noValidation, forgotPassword);
router.post("/reset-password", isPublic, noValidation, resetPassword);

// Flaw 5:
// CSRF Flaw - State changing action via GET request
// the fix:
// router.post('/delete-account', isAuthenticated, csrfProtection, deleteAccount);
router.get("/delete-account", isAuthenticated, noValidation, deleteAccount);

export default router;
