import { z } from 'zod';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function buildPaginationMeta(input: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const { page, limit, total } = input;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function toPrismaSkipTake(input: { page: number; limit: number }): { skip: number; take: number } {
  return { skip: (input.page - 1) * input.limit, take: input.limit };
}
