import { z } from 'zod';

export const updateProfileBodySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  bio: z.string().trim().max(2000).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
