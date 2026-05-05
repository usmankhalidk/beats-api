import { z } from 'zod';

export const updateProfileBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    bio: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'at least one field is required' });
export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;

export const updateAvatarBodySchema = z
  .object({
    avatarUrl: z.string().url().max(500),
  })
  .strict();
export type UpdateAvatarInput = z.infer<typeof updateAvatarBodySchema>;
