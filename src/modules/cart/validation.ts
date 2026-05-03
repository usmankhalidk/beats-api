import { z } from 'zod';

export const cartItemIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type CartItemIdParam = z.infer<typeof cartItemIdParamSchema>;

export const addCartItemBodySchema = z.object({
  beatId: z.string().uuid(),
  licenseType: z.enum(['basic', 'premium', 'exclusive']),
});
export type AddCartItemInput = z.infer<typeof addCartItemBodySchema>;
