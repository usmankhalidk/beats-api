import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

export const orderIdParamSchema = z.object({ id: z.string().uuid() });
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const listOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
});
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

export const checkoutBodySchema = z.object({
  // Reserved for future payment payload (provider, return URLs, etc.).
}).strict();
export type CheckoutInput = z.infer<typeof checkoutBodySchema>;
