import { prisma } from '@utils/prisma-client';

const STATUS_MAP: Record<string, number> = {
  pending: 0,
  paid: 1,
  failed: 2,
  cancelled: 3,
};

export async function listForUser(args: {
  userId: string;
  status?: string;
  skip: number;
  take: number;
}) {
  const where = {
    user_id: args.userId,
    type: 'purchase' as const,
    ...(args.status !== undefined ? { status: STATUS_MAP[args.status] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.transactions.findMany({
      where,
      skip: args.skip,
      take: args.take,
      orderBy: { created_at: 'desc' },
      include: {
        transaction_items: {
          include: {
            items: { select: { id: true, name: true, slug: true, thumbnail: true } },
          },
        },
      },
    }),
    prisma.transactions.count({ where }),
  ]);
  return { rows, total };
}

export async function findByIdForUser(id: string, userId: string) {
  return prisma.transactions.findFirst({
    where: { id, user_id: userId, type: 'purchase' },
    include: {
      transaction_items: {
        include: {
          items: { select: { id: true, name: true, slug: true, thumbnail: true } },
        },
      },
    },
  });
}

export async function findPurchasedItemIds(userId: string, itemIds: string[]): Promise<string[]> {
  const rows = await prisma.purchases.findMany({
    where: { user_id: userId, item_id: { in: itemIds }, status: true },
    select: { item_id: true },
  });
  return rows.map((r) => r.item_id);
}
