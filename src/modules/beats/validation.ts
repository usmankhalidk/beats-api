import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const SORT = z
  .enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'bpmAsc', 'bpmDesc'])
  .default('newest');

export const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
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

// ── Write schemas (multipart/form-data — all fields arrive as strings) ──────
const decimalString = z
  .string()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), {
    message: 'must be a decimal with up to 2 fractional digits',
  });

// tags: accept JSON array string OR comma-separated string
const tagsField = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return [];
    try {
      const parsed = JSON.parse(v) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]).map(String) : [];
    } catch {
      return v.split(',').map((t) => t.trim()).filter(Boolean);
    }
  });

export const createBeatBodySchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(5000).optional(),
  bpm: z.coerce.number().int().positive().max(400).optional(),
  musicKey: z.string().trim().max(10).optional(),
  regularPrice: decimalString,
  extendedPrice: decimalString,
  isFree: z.enum(['true', 'false']).transform((v) => v === 'true').default('false'),
  tags: tagsField,
  categoryId: z.string().uuid(),
  subCategoryId: z.string().uuid().optional(),
});
export type CreateBeatInput = z.infer<typeof createBeatBodySchema>;

export const replaceBeatBodySchema = createBeatBodySchema;
export type ReplaceBeatInput = z.infer<typeof replaceBeatBodySchema>;
