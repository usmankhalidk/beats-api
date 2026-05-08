import { z } from 'zod';

const bigIntId = z.string().regex(/^\d+$/, 'must be a numeric ID');

export const cartItemIdParamSchema = z.object({ id: bigIntId });
export type CartItemIdParam = z.infer<typeof cartItemIdParamSchema>;

export const addCartItemBodySchema = z
  .object({
    beatId: bigIntId,
    licenseType: z.enum(['regular', 'extended']),
  })
  .strict();
export type AddCartItemInput = z.infer<typeof addCartItemBodySchema>;
