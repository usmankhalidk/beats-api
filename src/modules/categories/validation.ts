import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(SLUG_PATTERN, 'invalid slug'),
});
export type SlugParam = z.infer<typeof slugParamSchema>;

export const categoryIdParamSchema = z.object({
  id: z.string().uuid('must be a valid UUID'),
});
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;

export const listCategoriesQuerySchema = z.object({}).strict();
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export const categoryBeatsQuerySchema = paginationQuerySchema.extend({
  sort: z
    .enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'bpmAsc', 'bpmDesc'])
    .default('newest'),
});
export type CategoryBeatsQuery = z.infer<typeof categoryBeatsQuerySchema>;

const nonNegInt = z.number().int().nonnegative();
const nonNegNum = z.number().nonnegative();

const categoryWriteShape = {
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255).regex(SLUG_PATTERN, 'invalid slug').optional(),
  title: z.string().trim().max(255).optional(),
  description: z.string().trim().max(255).optional(),
  regularBuyerFee: nonNegNum.optional(),
  extendedBuyerFee: nonNegNum.optional(),
  fileType: z.boolean().optional(),
  thumbnailWidth: nonNegInt.optional(),
  thumbnailHeight: nonNegInt.optional(),
  previewImageWidth: nonNegInt.optional(),
  previewImageHeight: nonNegInt.optional(),
  maximumScreenshots: nonNegInt.optional(),
  mainFileTypes: z.string().trim().min(1).max(255).optional(),
  maxPreviewFileSize: nonNegInt.optional(),
  sortId: nonNegInt.optional(),
} as const;

export const createCategoryBodySchema = z.object(categoryWriteShape).strict();
export type CreateCategoryInput = z.infer<typeof createCategoryBodySchema>;

export const updateCategoryBodySchema = z
  .object(categoryWriteShape)
  .partial()
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'at least one field is required' });
export type UpdateCategoryInput = z.infer<typeof updateCategoryBodySchema>;
