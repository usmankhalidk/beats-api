import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

const uuidId = z.string().uuid('must be a valid UUID');

export const orderIdParamSchema = z.object({ id: uuidId });
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const listOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'paid', 'failed', 'cancelled']).optional(),
});
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

export const validateOrderBodySchema = z
  .object({
    cartItemIds: z.array(uuidId).min(1),
  })
  .strict();
export type ValidateOrderInput = z.infer<typeof validateOrderBodySchema>;
