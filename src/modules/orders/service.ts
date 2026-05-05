import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import type { CheckoutInput, ListOrdersQuery, ValidateOrderInput } from './validation';

export interface OrderDTO {
  id: string;
  totalAmount: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: Date;
}

export interface OrderValidationResult {
  ok: boolean;
  issues: Array<{ cartItemId: string; reason: string }>;
}

export async function listOrders(
  _userId: string,
  _query: ListOrdersQuery,
): Promise<{ items: OrderDTO[]; meta: PaginationMeta }> {
  throw Errors.notImplemented({ feature: 'orders.list' });
}

export async function getOrder(_userId: string, _id: string): Promise<OrderDTO> {
  throw Errors.notImplemented({ feature: 'orders.get' });
}

export async function validateOrder(
  _userId: string,
  _input: ValidateOrderInput,
): Promise<OrderValidationResult> {
  throw Errors.notImplemented({ feature: 'orders.validate' });
}

/**
 * Per spec: /checkout permanently returns NOT_IMPLEMENTED until a payment
 * provider is integrated. All other behavior is wired up around it.
 */
export async function checkout(_userId: string, _input: CheckoutInput): Promise<never> {
  throw Errors.notImplemented({ feature: 'orders.checkout' });
}
