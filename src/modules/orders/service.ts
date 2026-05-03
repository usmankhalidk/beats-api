import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import type { CheckoutInput, ListOrdersQuery } from './validation';

export interface OrderDTO {
  id: string;
  totalAmount: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: Date;
}

export async function listOrders(_userId: string, _query: ListOrdersQuery): Promise<{ items: OrderDTO[]; meta: PaginationMeta }> {
  throw Errors.notImplemented({ feature: 'orders.list' });
}

export async function getOrder(_userId: string, _id: string): Promise<OrderDTO> {
  throw Errors.notImplemented({ feature: 'orders.get' });
}

/**
 * Checkout intentionally returns NOT_IMPLEMENTED — wired later when a
 * payment provider is selected. Per spec.
 */
export async function checkout(_userId: string, _input: CheckoutInput): Promise<never> {
  throw Errors.notImplemented({ feature: 'orders.checkout' });
}
