import { z } from 'zod';

export const purchaseIdParamSchema = z.object({ id: z.string().uuid('must be a valid UUID') });
export type PurchaseIdParam = z.infer<typeof purchaseIdParamSchema>;

export const listPurchasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListPurchasesQuery = z.infer<typeof listPurchasesQuerySchema>;
