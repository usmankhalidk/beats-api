import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import type { EarningsQuery, SalesQuery } from './validation';

export interface EarningDTO {
  id: string;
  amount: string;
  sourceOrderId: string;
  createdAt: Date;
}

export interface SaleDTO {
  orderItemId: string;
  beatId: string;
  licenseType: 'basic' | 'premium' | 'exclusive';
  price: string;
  orderId: string;
  soldAt: Date;
}

export async function getEarnings(
  _producerId: string,
  _query: EarningsQuery,
): Promise<{ items: EarningDTO[]; meta: PaginationMeta; totalAmount: string }> {
  throw Errors.notImplemented({ feature: 'dashboard.earnings' });
}

export async function getSales(
  _producerId: string,
  _query: SalesQuery,
): Promise<{ items: SaleDTO[]; meta: PaginationMeta }> {
  throw Errors.notImplemented({ feature: 'dashboard.sales' });
}
