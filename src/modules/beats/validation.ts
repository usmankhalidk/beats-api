import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const SORT = z
  .enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'bpmAsc', 'bpmDesc'])
  .default('newest');

// Items use BigInt auto-increment ids, not UUIDs
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a positive integer'),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const listBeatsQuerySchema = paginationQuerySchema.extend({ sort: SORT });
export type ListBeatsQuery = z.infer<typeof listBeatsQuerySchema>;

export const searchBeatsQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().trim().min(1).max(200).optional(),
    bpm: z.coerce.number().int().positive().max(400).optional(),
    tag: z.string().trim().min(1).max(100).optional(),
    sort: SORT,
  })
  .refine((v) => v.q !== undefined || v.bpm !== undefined || v.tag !== undefined, {
    message: 'at least one of q, bpm, or tag is required',
  });
export type SearchBeatsQuery = z.infer<typeof searchBeatsQuerySchema>;

export const filterBeatsQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().optional(),
  subCategory: z.string().trim().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  isFree: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  sort: SORT,
});
export type FilterBeatsQuery = z.infer<typeof filterBeatsQuerySchema>;

export const featuredBeatsQuerySchema = paginationQuerySchema;
export type FeaturedBeatsQuery = z.infer<typeof featuredBeatsQuerySchema>;

export const freeBeatsQuerySchema = paginationQuerySchema;
export type FreeBeatsQuery = z.infer<typeof freeBeatsQuerySchema>;

// ── Write schemas (producer endpoints, implemented later) ────────────────────
const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? v.toString() : v))
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), {
    message: 'must be a decimal with up to 2 fractional digits',
  });

export const createBeatBodySchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(5000).optional(),
  bpm: z.number().int().positive().max(400),
  regularPrice: decimalString,
  extendedPrice: decimalString,
  isFree: z.boolean().default(false),
  audioUrl: z.string().url().max(500).optional(),
  coverImageUrl: z.string().url().max(500).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  categoryId: z.string().regex(/^\d+$/),
  subCategoryId: z.string().regex(/^\d+$/).optional(),
});
export type CreateBeatInput = z.infer<typeof createBeatBodySchema>;

export const replaceBeatBodySchema = createBeatBodySchema;
export type ReplaceBeatInput = z.infer<typeof replaceBeatBodySchema>;
