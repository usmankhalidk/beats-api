import { Errors } from '@utils/api-error';
import { prisma } from '@utils/prisma-client';
import type { AddCartItemInput } from './validation';
import * as cartRepo from './repository';

const LICENSE_LABEL: Record<number, 'regular' | 'extended'> = { 1: 'regular', 2: 'extended' };

function mapCartItem(row: Awaited<ReturnType<typeof cartRepo.listForUser>>[number]) {
  return {
    id: row.id,
    itemId: row.item_id,
    licenseType: LICENSE_LABEL[row.licenseType] ?? 'regular',
    quantity: row.quantity,
    item: {
      id: row.items.id,
      name: row.items.name,
      slug: row.items.slug,
      thumbnail: row.items.thumbnail ?? null,
      regularPrice: row.items.regular_price,
      extendedPrice: row.items.extended_price,
      bpm: row.items.bpm ?? null,
    },
  };
}

export async function listCart(userId: string) {
  const rows = await cartRepo.listForUser(userId);
  return rows.map(mapCartItem);
}

export async function addItem(userId: string, input: AddCartItemInput) {
  const itemId = input.beatId;
  const userIdBig = userId;

  const beat = await prisma.items.findFirst({
    where: { id: itemId, status: 1, purchasing_status: true },
    select: { id: true, name: true, slug: true, thumbnail: true, regular_price: true, extended_price: true, bpm: true },
  });
  if (!beat) throw Errors.notFound({ resource: 'beat', id: input.beatId });

  const existing = await cartRepo.findExisting(userIdBig, itemId, input.licenseType);
  if (existing) throw Errors.conflict({ reason: 'already_in_cart' });

  const row = await cartRepo.add(userIdBig, itemId, input.licenseType);
  return mapCartItem(row);
}

export async function removeItem(userId: string, cartItemId: string): Promise<void> {
  await cartRepo.removeById(cartItemId, userId);
}
