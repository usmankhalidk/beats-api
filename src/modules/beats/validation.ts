import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? v.toString() : v))
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), { message: 'must be a decimal with up to 2 fractional digits' });

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const listBeatsQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
  bpmMin: z.coerce.number().int().positive().optional(),
  bpmMax: z.coerce.number().int().positive().optional(),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  isFree: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  sort: z.enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'bpmAsc', 'bpmDesc']).default('newest'),
});
export type ListBeatsQuery = z.infer<typeof listBeatsQuerySchema>;

export const createBeatBodySchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  bpm: z.number().int().positive().max(400),
  priceBasic: decimalString,
  pricePremium: decimalString,
  priceExclusive: decimalString,
  isFree: z.boolean().default(false),
  audioUrl: z.string().url().max(500).optional(),
  coverImageUrl: z.string().url().max(500).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});
export type CreateBeatInput = z.infer<typeof createBeatBodySchema>;

export const updateBeatBodySchema = createBeatBodySchema.partial();
export type UpdateBeatInput = z.infer<typeof updateBeatBodySchema>;
