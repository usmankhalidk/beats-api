import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

export const orderIdParamSchema = z.object({ id: z.string().uuid() });
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const listOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
});
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

/**
 * POST /orders/validate — pre-checkout validation: confirm cart items are
 * still purchasable (not soft-deleted, exclusive license still available, etc.)
 * Pass an explicit list of cart item IDs to validate.
 */
export const validateOrderBodySchema = z
  .object({
    cartItemIds: z.array(z.string().uuid()).min(1),
  })
  .strict();
export type ValidateOrderInput = z.infer<typeof validateOrderBodySchema>;

/**
 * POST /checkout — body reserved for future payment provider payload.
 * Currently always returns NOT_IMPLEMENTED per spec.
 */
export const checkoutBodySchema = z
  .object({
    cartItemIds: z.array(z.string().uuid()).min(1).optional(),
  })
  .strict();
export type CheckoutInput = z.infer<typeof checkoutBodySchema>;
