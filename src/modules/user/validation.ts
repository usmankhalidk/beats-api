import { z } from 'zod';

const socialLinksSchema = z
  .object({
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    youtube: z.string().url().optional(),
    soundcloud: z.string().url().optional(),
    spotify: z.string().url().optional(),
    website: z.string().url().optional(),
  })
  .optional()
  .nullable();

export const updateProfileBodySchema = z
  .object({
    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
    userName: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_.-]+$/)
      .nullable()
      .optional(),
    profileHeading: z.string().trim().max(255).nullable().optional(),
    profileDescription: z.string().trim().max(5000).nullable().optional(),
    profileContactEmail: z.string().trim().toLowerCase().email().max(255).nullable().optional(),
    profileSocialLinks: socialLinksSchema,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'at least one field is required' });

export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
