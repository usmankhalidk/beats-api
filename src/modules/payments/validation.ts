import { z } from 'zod';

const uuidId = z.string().uuid('must be a valid UUID');
const currencyEnum = z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'NGN']);
const gatewayEnum = z.enum(['paystack', 'flutterwave', 'opay']);

export const createCheckoutBodySchema = z
  .object({
    cartItemIds: z.array(uuidId).min(1),
    currency: currencyEnum,
  })
  .strict();
export type CreateCheckoutInput = z.infer<typeof createCheckoutBodySchema>;

export const checkoutIdParamSchema = z.object({ id: uuidId });
export type CheckoutIdParam = z.infer<typeof checkoutIdParamSchema>;

export const billingSchema = z
  .object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    address1: z.string().min(1).max(255),
    address2: z.string().max(255).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().length(2, 'must be an ISO 3166-1 alpha-2 code'),
  })
  .strict();
export type BillingInput = z.infer<typeof billingSchema>;

export const payBodySchema = z
  .object({
    gateway: gatewayEnum,
    currency: currencyEnum,
    billing: billingSchema,
  })
  .strict();
export type PayInput = z.infer<typeof payBodySchema>;
