import { Errors } from '@utils/api-error';
import { buildPaginationMeta, toPrismaSkipTake } from '@utils/pagination';
import * as purchasesRepo from './repository';
import type { ListPurchasesQuery } from './validation';

export interface PurchaseDTO {
  id: string;
  code: string;
  itemId: string;
  name: string | null;
  slug: string | null;
  thumbnail: string | null;
  licenseType: 'regular' | 'extended';
  isDownloaded: boolean;
  purchasedAt: Date | null;
}

function mapPurchase(row: purchasesRepo.PurchaseRow | purchasesRepo.PurchaseListRow): PurchaseDTO {
  return {
    id: row.id,
    code: row.code,
    itemId: row.item_id,
    name: row.items?.name ?? null,
    slug: row.items?.slug ?? null,
    thumbnail: row.items?.thumbnail ?? null,
    licenseType: row.license_type ? 'extended' : 'regular',
    isDownloaded: row.is_downloaded,
    purchasedAt: row.created_at ?? null,
  };
}

export async function listPurchases(userId: string, query: ListPurchasesQuery) {
  const { skip, take } = toPrismaSkipTake(query);
  const { rows, total } = await purchasesRepo.listForUser(userId, skip, take);
  return {
    items: rows.map(mapPurchase),
    meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
  };
}

export async function getPurchase(userId: string, id: string): Promise<PurchaseDTO> {
  const row = await purchasesRepo.findByIdForUser(id, userId);
  if (!row) throw Errors.notFound({ resource: 'purchase', id });
  return mapPurchase(row);
}
