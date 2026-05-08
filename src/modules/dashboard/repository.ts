import type { Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export type SaleRow = {
  id: bigint;
  author_id: bigint;
  user_id: bigint;
  item_id: bigint;
  license_type: boolean;
  price: number;
  author_earning: number | null;
  created_at: Date | null;
};

export async function listSalesForProducer(args: {
  producerId: bigint;
  from?: Date;
  to?: Date;
  skip: number;
  take: number;
}): Promise<{ rows: SaleRow[]; total: number; totalEarning: number }> {
  const where: Prisma.salesWhereInput = {
    author_id: args.producerId,
    ...(args.from || args.to
      ? {
          created_at: {
            ...(args.from ? { gte: args.from } : {}),
            ...(args.to ? { lte: args.to } : {}),
          },
        }
      : {}),
  };

  const [rows, total, agg] = await Promise.all([
    prisma.sales.findMany({
      where,
      skip: args.skip,
      take: args.take,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        author_id: true,
        user_id: true,
        item_id: true,
        license_type: true,
        price: true,
        author_earning: true,
        created_at: true,
      },
    }),
    prisma.sales.count({ where }),
    prisma.sales.aggregate({ where, _sum: { author_earning: true } }),
  ]);

  return {
    rows: rows as SaleRow[],
    total,
    totalEarning: agg._sum.author_earning ?? 0,
  };
}
