import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const bigIntId = z.string().regex(/^\d+$/, 'must be a numeric ID');

export const orderIdParamSchema = z.object({ id: bigIntId });
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const listOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
});
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

export const validateOrderBodySchema = z
  .object({
    cartItemIds: z.array(bigIntId).min(1),
  })
  .strict();
export type ValidateOrderInput = z.infer<typeof validateOrderBodySchema>;

export const checkoutBodySchema = z
  .object({
    cartItemIds: z.array(bigIntId).min(1).optional(),
  })
  .strict();
export type CheckoutInput = z.infer<typeof checkoutBodySchema>;
