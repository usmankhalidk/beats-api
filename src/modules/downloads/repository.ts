import { prisma } from '@utils/prisma-client';

export type PurchaseRow = NonNullable<Awaited<ReturnType<typeof findPurchase>>>;

export async function findPurchase(id: string, userId: string) {
  return prisma.purchases.findFirst({
    where: { id, user_id: userId, status: true },
    select: {
      id: true,
      item_id: true,
      license_type: true,
      items: {
        select: { name: true, main_file: true },
      },
    },
  });
}
