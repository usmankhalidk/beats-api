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
  sort: z.enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'bpmAsc', 'bpmDesc']).default('newest'),
});
export type ListBeatsQuery = z.infer<typeof listBeatsQuerySchema>;

/** GET /beats/search — SQL search over title, bpm, tag name. */
export const searchBeatsQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
  bpm: z.coerce.number().int().positive().max(400).optional(),
  tag: z.string().trim().min(1).max(100).optional(),
}).refine((v) => v.q !== undefined || v.bpm !== undefined || v.tag !== undefined, {
  message: 'at least one of q, bpm, or tag is required',
});
export type SearchBeatsQuery = z.infer<typeof searchBeatsQuerySchema>;

/** GET /beats/filter — facet filters (genre/category, price range, free flag). */
export const filterBeatsQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().min(1).max(100).optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  isFree: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});
export type FilterBeatsQuery = z.infer<typeof filterBeatsQuerySchema>;

export const featuredBeatsQuerySchema = paginationQuerySchema;
export type FeaturedBeatsQuery = z.infer<typeof featuredBeatsQuerySchema>;

export const freeBeatsQuerySchema = paginationQuerySchema;
export type FreeBeatsQuery = z.infer<typeof freeBeatsQuerySchema>;

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

/** PUT semantics — full replacement; all fields required (except optional ones). */
export const replaceBeatBodySchema = createBeatBodySchema;
export type ReplaceBeatInput = z.infer<typeof replaceBeatBodySchema>;
