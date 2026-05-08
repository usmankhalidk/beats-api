import { prisma } from '@utils/prisma-client';

const LICENSE_TYPE_MAP = { regular: 1, extended: 2 } as const;

export async function listForUser(userId: bigint) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          regular_price: true,
          extended_price: true,
          bpm: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function findExisting(userId: bigint, itemId: bigint, licenseType: 'regular' | 'extended') {
  return prisma.cartItem.findFirst({
    where: { userId, item_id: itemId, licenseType: LICENSE_TYPE_MAP[licenseType] },
  });
}

export async function add(userId: bigint, itemId: bigint, licenseType: 'regular' | 'extended') {
  return prisma.cartItem.create({
    data: {
      userId,
      item_id: itemId,
      licenseType: LICENSE_TYPE_MAP[licenseType],
    },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          regular_price: true,
          extended_price: true,
          bpm: true,
        },
      },
    },
  });
}

export async function removeById(id: bigint, userId: bigint) {
  await prisma.cartItem.deleteMany({ where: { id, userId } });
}

export async function clearForUser(userId: bigint) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
