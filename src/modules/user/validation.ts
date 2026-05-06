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
    firstname: z.string().trim().min(1).max(50).optional(),
    lastname: z.string().trim().min(1).max(50).optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_.-]+$/)
      .nullable()
      .optional(),
    profile_heading: z.string().trim().max(255).nullable().optional(),
    profile_description: z.string().trim().max(5000).nullable().optional(),
    profile_contact_email: z.string().trim().toLowerCase().email().max(255).nullable().optional(),
    profile_social_links: socialLinksSchema,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'at least one field is required' });

export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
