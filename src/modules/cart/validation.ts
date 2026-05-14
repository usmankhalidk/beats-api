import { z } from 'zod';

const uuidId = z.string().uuid('must be a valid UUID');

export const cartItemIdParamSchema = z.object({ id: uuidId });
export type CartItemIdParam = z.infer<typeof cartItemIdParamSchema>;

export const addCartItemBodySchema = z
  .object({
    beatId: uuidId,
    licenseType: z.enum(['regular', 'extended']),
  })
  .strict();
export type AddCartItemInput = z.infer<typeof addCartItemBodySchema>;
