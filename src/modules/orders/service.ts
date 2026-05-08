import { Errors } from '@utils/api-error';
import { buildPaginationMeta, toPrismaSkipTake } from '@utils/pagination';
import { prisma } from '@utils/prisma-client';
import type { CheckoutInput, ListOrdersQuery, ValidateOrderInput } from './validation';
import * as ordersRepo from './repository';

const STATUS_LABEL: Record<number, 'pending' | 'paid' | 'failed' | 'cancelled'> = {
  0: 'pending',
  1: 'paid',
  2: 'failed',
  3: 'cancelled',
};

function toId(s: string): bigint {
  return BigInt(s);
}

function mapTransaction(tx: Awaited<ReturnType<typeof ordersRepo.findByIdForUser>>) {
  if (!tx) return null;
  return {
    id: tx.id.toString(),
    amount: tx.amount,
    fees: tx.fees ?? 0,
    total: tx.total,
    status: STATUS_LABEL[tx.status] ?? 'pending',
    createdAt: tx.created_at,
    items: tx.transaction_items.map((ti) => ({
      id: ti.id.toString(),
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
    userId: toId(userId),
    status: query.status,
    skip,
    take,
  });
  const items = rows.map((tx) => mapTransaction(tx)!);
  const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
  return { items, meta };
}

export async function getOrder(userId: string, id: string) {
  const tx = await ordersRepo.findByIdForUser(toId(id), toId(userId));
  if (!tx) throw Errors.notFound({ resource: 'order', id });
  return mapTransaction(tx)!;
}

export async function validateOrder(userId: string, input: ValidateOrderInput) {
  const userIdBig = toId(userId);
  const cartItemIds = input.cartItemIds.map(toId);

  const cartItems = await prisma.cartItem.findMany({
    where: { id: { in: cartItemIds }, userId: userIdBig },
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

  const foundIds = new Set(cartItems.map((ci) => ci.id.toString()));
  const issues: Array<{ cartItemId: string; reason: string }> = [];

  for (const id of input.cartItemIds) {
    if (!foundIds.has(id)) {
      issues.push({ cartItemId: id, reason: 'not_found' });
      continue;
    }
    const ci = cartItems.find((c) => c.id.toString() === id)!;
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
    const alreadyOwned = await ordersRepo.findPurchasedItemIds(userIdBig, itemIds);
    const ownedSet = new Set(alreadyOwned.map(String));
    for (const ci of cartItems) {
      if (ownedSet.has(ci.item_id.toString())) {
        issues.push({ cartItemId: ci.id.toString(), reason: 'already_purchased' });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export async function checkout(_userId: string, _input: CheckoutInput): Promise<never> {
  throw Errors.notImplemented({ feature: 'checkout — payment provider not integrated' });
}
