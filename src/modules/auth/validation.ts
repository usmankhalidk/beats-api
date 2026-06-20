import { z } from 'zod';

export const registerBodySchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  userName: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
  email: z.string().trim().toLowerCase().email().max(100),
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'producer']).optional().default('user'),
});
export type RegisterInput = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginBodySchema>;

export const googleSignInBodySchema = z.object({
  // The Google-issued ID token (JWT) obtained client-side via Google Identity
  // Services (web) or the native Google Sign-In SDK (mobile).
  idToken: z.string().min(1),
  // Only applied when this token provisions a brand-new account; ignored for
  // existing users (who keep their current role).
  role: z.enum(['user', 'producer']).optional().default('user'),
});
export type GoogleSignInInput = z.infer<typeof googleSignInBodySchema>;

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

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ['newPassword'],
    message: 'newPassword must be different from currentPassword',
  });
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;

export const verifyEmailBodySchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailBodySchema>;

export const resendVerificationBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type ResendVerificationInput = z.infer<typeof resendVerificationBodySchema>;
