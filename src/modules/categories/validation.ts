import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(SLUG_PATTERN, 'invalid slug'),
});
export type SlugParam = z.infer<typeof slugParamSchema>;

export const listCategoriesQuerySchema = z.object({}).strict();
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export const categoryBeatsQuerySchema = paginationQuerySchema.extend({
  sort: z
    .enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'bpmAsc', 'bpmDesc'])
    .default('newest'),
});
export type CategoryBeatsQuery = z.infer<typeof categoryBeatsQuerySchema>;
