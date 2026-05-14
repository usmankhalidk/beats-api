import { buildPaginationMeta, toPrismaSkipTake } from '@utils/pagination';
import type { PaginationMeta } from '@utils/pagination';
import * as dashboardRepo from './repository';
import type { SaleRow } from './repository';
import type { EarningsQuery, SalesQuery } from './validation';

export interface EarningDTO {
  id: string;
  itemId: string;
  buyerId: string;
  licenseType: 'regular' | 'extended';
  salePrice: string;
  authorEarning: string;
  soldAt: string | null;
}

export type SaleDTO = EarningDTO;

function mapRow(row: SaleRow): EarningDTO {
  return {
    id: row.id,
    itemId: row.item_id,
    buyerId: row.user_id,
    licenseType: row.license_type ? 'extended' : 'regular',
    salePrice: row.price.toString(),
    authorEarning: (row.author_earning ?? 0).toString(),
    soldAt: row.created_at?.toISOString() ?? null,
  };
}

export async function getEarnings(
  producerId: string,
  query: EarningsQuery,
): Promise<{ items: EarningDTO[]; meta: PaginationMeta; totalAmount: string }> {
  const { skip, take } = toPrismaSkipTake(query);
  const { rows, total, totalEarning } = await dashboardRepo.listSalesForProducer({
    producerId: producerId,
    from: query.from,
    to: query.to,
    skip,
    take,
  });
  return {
    items: rows.map(mapRow),
    meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
    totalAmount: totalEarning.toString(),
  };
}

export async function getSales(
  producerId: string,
  query: SalesQuery,
): Promise<{ items: SaleDTO[]; meta: PaginationMeta }> {
  const { skip, take } = toPrismaSkipTake(query);
  const { rows, total } = await dashboardRepo.listSalesForProducer({
    producerId: producerId,
    from: query.from,
    to: query.to,
    skip,
    take,
  });
  return {
    items: rows.map(mapRow),
    meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
  };
}
