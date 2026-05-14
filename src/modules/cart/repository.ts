import { prisma } from '@utils/prisma-client';

const LICENSE_TYPE_MAP = { regular: 1, extended: 2 } as const;

export async function listForUser(userId: string) {
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

export async function findExisting(userId: string, itemId: string, licenseType: 'regular' | 'extended') {
  return prisma.cartItem.findFirst({
    where: { userId, item_id: itemId, licenseType: LICENSE_TYPE_MAP[licenseType] },
  });
}

export async function add(userId: string, itemId: string, licenseType: 'regular' | 'extended') {
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

export async function removeById(id: string, userId: string) {
  await prisma.cartItem.deleteMany({ where: { id, userId } });
}

export async function clearForUser(userId: string) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
