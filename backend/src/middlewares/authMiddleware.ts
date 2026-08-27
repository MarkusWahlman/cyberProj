// eslint-disable-next-line no-restricted-imports
import type { Request, NextFunction, RequestHandler } from "express";
import type { TypedResponse } from "../utils/typedExpress.ts";
import type { Role } from "../config/db.ts";
import type { ErrorResponse } from "shared";
import passport from "../config/passport.ts";

export type AuthMiddleware = RequestHandler & { isAuthMiddleware: true; allowLateAuth?: boolean };

const markAsAuth = (fn: RequestHandler): AuthMiddleware => {
  (fn as AuthMiddleware).isAuthMiddleware = true;
  return fn as AuthMiddleware;
};

// Wraps an auth middleware to explicitly mark that it is allowed to execute AFTER validation
export const lateAuth = (fn: AuthMiddleware): AuthMiddleware => {
  const wrapped = (req: unknown, res: unknown, next: NextFunction) =>
    fn(req as Request, res as TypedResponse<ErrorResponse>, next);
  (wrapped as AuthMiddleware).isAuthMiddleware = true;
  (wrapped as AuthMiddleware).allowLateAuth = true;
  return wrapped as AuthMiddleware;
};

export const isAuthenticated = markAsAuth(
  (req: Request, res: TypedResponse<ErrorResponse>, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  },
);

export const isPublic = markAsAuth(
  (_req: Request, _res: TypedResponse<unknown>, next: NextFunction) => {
    // Explicit marker for routes that don't require authentication
    next();
  },
);

export const requireRole = (role: Role) => {
  return markAsAuth((req: Request, res: TypedResponse<ErrorResponse>, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = req.user;
    if (user && user.role === role) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
  });
};

export const isAdmin = requireRole("admin");

export const localAuth = markAsAuth(
  (req: Request, res: TypedResponse<ErrorResponse>, next: NextFunction) => {
    passport.authenticate(
      "local",
      (err: unknown, user: Express.User | false, info: { message?: string } | undefined) => {
        if (err) return next(err);
        if (!user) {
          res.status(401).json({ message: info?.message || "Authentication failed" });
          return;
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          next();
        });
      },
    )(req, res, next);
  },
);

export const csrfProtection = markAsAuth(
  (req: Request, res: TypedResponse<ErrorResponse>, next: NextFunction) => {
    if (req.headers["x-requested-with"] !== "XMLHttpRequest") {
      res.status(403).json({ message: "Forbidden: CSRF protection failed" });
      return;
    }
    next();
  },
);
