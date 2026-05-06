import { z } from 'zod';

export const registerBodySchema = z.object({
  firstname: z.string().trim().min(1).max(50),
  lastname: z.string().trim().min(1).max(50),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
  email: z.string().trim().toLowerCase().email().max(100),
  password: z.string().min(8).max(128),
  is_author: z.boolean().optional(),
});
export type RegisterInput = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginBodySchema>;

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1),
});
export type LogoutInput = z.infer<typeof logoutBodySchema>;

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;
