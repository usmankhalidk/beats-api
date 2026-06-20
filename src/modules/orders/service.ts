import { Errors } from '@utils/api-error';
import { buildPaginationMeta, toPrismaSkipTake } from '@utils/pagination';
import { prisma } from '@utils/prisma-client';
import type { ListOrdersQuery, ValidateOrderInput } from './validation';
import * as ordersRepo from './repository';

const STATUS_LABEL: Record<number, 'pending' | 'paid' | 'failed' | 'cancelled'> = {
  0: 'pending',
  1: 'paid',
  2: 'failed',
  3: 'cancelled',
};

function mapTransaction(tx: Awaited<ReturnType<typeof ordersRepo.findByIdForUser>>) {
  if (!tx) return null;
  return {
    id: tx.id,
    amount: tx.amount,
    fees: tx.fees ?? 0,
    total: tx.total,
    currency: tx.charge_currency ?? 'NGN',
    displayCurrency: tx.display_currency ?? tx.charge_currency ?? 'NGN',
    displayTotal: tx.display_total ?? tx.total,
    status: STATUS_LABEL[tx.status] ?? 'pending',
    createdAt: tx.created_at,
    items: tx.transaction_items.map((ti) => ({
      id: ti.id,
      itemId: ti.item_id?.toString() ?? null,
      name: ti.items?.name ?? null,
      slug: ti.items?.slug ?? null,
      thumbnail: ti.items?.thumbnail ?? null,
      licenseType: ti.license_type === 2 ? 'extended' : 'regular',
      price: ti.price,
      quantity: ti.quantity,
      total: ti.total,
    })),
  };
}

export async function listOrders(userId: string, query: ListOrdersQuery) {
  const { skip, take } = toPrismaSkipTake(query);
  const { rows, total } = await ordersRepo.listForUser({
    userId: userId,
    status: query.status,
    skip,
    take,
  });
  const items = rows.map((tx) => mapTransaction(tx)!);
  const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
  return { items, meta };
}

export async function getOrder(userId: string, id: string) {
  const tx = await ordersRepo.findByIdForUser(id, userId);
  if (!tx) throw Errors.notFound({ resource: 'order', id });
  return mapTransaction(tx)!;
}

export async function validateOrder(userId: string, input: ValidateOrderInput) {
  const cartItems = await prisma.cartItem.findMany({
    where: { id: { in: input.cartItemIds }, userId },
    include: {
      items: {
        select: {
          id: true,
          status: true,
          purchasing_status: true,
        },
      },
    },
  });

  const foundIds = new Set(cartItems.map((ci) => ci.id));
  const issues: Array<{ cartItemId: string; reason: string }> = [];

  for (const id of input.cartItemIds) {
    if (!foundIds.has(id)) {
      issues.push({ cartItemId: id, reason: 'not_found' });
      continue;
    }
    const ci = cartItems.find((c) => c.id === id)!;
    if (ci.items.status !== 1) {
      issues.push({ cartItemId: id, reason: 'beat_not_published' });
      continue;
    }
    if (!ci.items.purchasing_status) {
      issues.push({ cartItemId: id, reason: 'beat_not_purchasable' });
    }
  }

  if (issues.length === 0) {
    const itemIds = cartItems.map((ci) => ci.item_id);
    const alreadyOwned = await ordersRepo.findPurchasedItemIds(userId, itemIds);
    const ownedSet = new Set(alreadyOwned);
    for (const ci of cartItems) {
      if (ownedSet.has(ci.item_id)) {
        issues.push({ cartItemId: ci.id, reason: 'already_purchased' });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
