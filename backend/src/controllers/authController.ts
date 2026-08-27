import type { NextFunction } from "express";
import type {
  TypedResponse,
  TypedRequestBody,
  TypedRequest,
  TypedRequestQuery,
} from "../utils/typedExpress.ts";
import {
  AuthSuccessResponseSchema,
  MessageResponseSchema,
  type AuthSuccessResponse,
  type MessageResponse,
  type ErrorResponse,
  type RegisterData,
} from "shared";
import { authService } from "../services/authService.ts";

export const register = async (
  req: TypedRequestBody<RegisterData>,
  res: TypedResponse<AuthSuccessResponse | ErrorResponse>,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;
    const { user: newUser, usernameExists } = await authService.registerUser(username, password);
    if (usernameExists) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }
    if (!newUser) {
      res.status(500).json({ message: "Registration failed" });
      return;
    }

    req.login(newUser, (err) => {
      if (err) return next(err);
      res.status(201).json(
        AuthSuccessResponseSchema.parse({
          message: "Registration successful",
          user: newUser,
        }),
      );
    });
  } catch (error) {
    next(error);
  }
};

export const login = (
  req: TypedRequest,
  res: TypedResponse<AuthSuccessResponse | ErrorResponse>,
) => {
  res.json(
    AuthSuccessResponseSchema.parse({
      message: "Logged in successfully",
      user: req.user,
    }),
  );
};

export const logout = (
  req: TypedRequest,
  res: TypedResponse<MessageResponse | ErrorResponse>,
  next: NextFunction,
) => {
  req.logout((logoutErr) => {
    if (logoutErr) return next(logoutErr);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie("connect.sid");
      res.json(MessageResponseSchema.parse({ message: "Logged out successfully" }));
    });
  });
};

export const getAllUsers = async (
  req: TypedRequest,
  res: TypedResponse<unknown>,
  next: NextFunction,
) => {
  try {
    const users = await authService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (
  req: TypedRequestQuery<{ q?: string }>,
  res: TypedResponse<unknown>,
  next: NextFunction,
) => {
  try {
    const query = req.query.q || "";
    const users = await authService.searchUsers(query);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: TypedRequestBody<{ username: string }>,
  res: TypedResponse<unknown>,
  next: NextFunction,
) => {
  try {
    const { username } = req.body;
    const token = await authService.generateResetToken(username);
    if (!token) {
      res.json({ message: "If the user exists, a reset link has been generated." });
      return;
    }

    // This would actually return 
    // res.json({ message: "If the user exists, a reset link has been generated." });
    // and send an email. However, we return the token
    // for demonstration purposes.
    res.json({ message: "Reset token generated (simulating email)", token });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: TypedRequestBody<{ token: string; newPassword: string }>,
  res: TypedResponse<unknown>,
  next: NextFunction,
) => {
  try {
    const { token, newPassword } = req.body;
    const success = await authService.resetPassword(token, newPassword);
    if (success) {
      res.json({ message: "Password reset successful" });
    } else {
      res.status(400).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: TypedRequest,
  res: TypedResponse<unknown>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    await authService.deleteUser(req.user.id);

    req.logout((logoutErr) => {
      if (logoutErr) return next(logoutErr);
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("connect.sid");
        res.json({ message: "Account deleted successfully" });
      });
    });
  } catch (error) {
    next(error);
  }
};
