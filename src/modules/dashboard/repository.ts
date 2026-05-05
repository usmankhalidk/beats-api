import type { Earning, OrderItem, Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function listEarningsForProducer(args: {
  producerId: string;
  where: Prisma.EarningWhereInput;
  skip: number;
  take: number;
}): Promise<{ rows: Earning[]; total: number; sum: string }> {
  const where: Prisma.EarningWhereInput = { producerId: args.producerId, ...args.where };
  const [rows, total, agg] = await Promise.all([
    prisma.earning.findMany({ where, skip: args.skip, take: args.take, orderBy: { createdAt: 'desc' } }),
    prisma.earning.count({ where }),
    prisma.earning.aggregate({ where, _sum: { amount: true } }),
  ]);
  return { rows, total, sum: (agg._sum.amount ?? '0').toString() };
}

export async function listSalesForProducer(args: {
  producerId: string;
  where: Prisma.OrderItemWhereInput;
  skip: number;
  take: number;
}): Promise<{ rows: OrderItem[]; total: number }> {
  const where: Prisma.OrderItemWhereInput = {
    beat: { producerId: args.producerId },
    order: { status: 'paid' },
    ...args.where,
  };
  const [rows, total] = await Promise.all([
    prisma.orderItem.findMany({ where, skip: args.skip, take: args.take, include: { order: true } }),
    prisma.orderItem.count({ where }),
  ]);
  return { rows, total };
}
