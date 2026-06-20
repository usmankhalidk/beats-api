import { prisma } from '@utils/prisma-client';

const ITEM_SELECT = {
  id: true,
  name: true,
  slug: true,
  thumbnail: true,
} as const;

export type PurchaseRow = NonNullable<Awaited<ReturnType<typeof findByIdForUser>>>;
export type PurchaseListRow = Awaited<ReturnType<typeof listForUser>>['rows'][number];

export async function listForUser(userId: string, skip: number, take: number) {
  const [rows, total] = await prisma.$transaction([
    prisma.purchases.findMany({
      where: { user_id: userId, status: true },
      orderBy: { created_at: 'desc' },
      skip,
      take,
      select: {
        id: true,
        code: true,
        item_id: true,
        license_type: true,
        is_downloaded: true,
        created_at: true,
        items: { select: ITEM_SELECT },
      },
    }),
    prisma.purchases.count({ where: { user_id: userId, status: true } }),
  ]);
  return { rows, total };
}

export async function findByIdForUser(id: string, userId: string) {
  return prisma.purchases.findFirst({
    where: { id, user_id: userId, status: true },
    select: {
      id: true,
      code: true,
      item_id: true,
      license_type: true,
      is_downloaded: true,
      created_at: true,
      items: { select: ITEM_SELECT },
    },
  });
}
