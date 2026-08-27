import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = registerSchema; // For now they share the same structure

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: z.string(),
});

export const AuthSuccessResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
});

export const CurrentUserResponseSchema = z.object({
  user: UserSchema,
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.any().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type AuthSuccessResponse = z.infer<typeof AuthSuccessResponseSchema>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
