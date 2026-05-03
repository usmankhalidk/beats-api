import type { Order, Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function listForUser(args: {
  userId: string;
  where: Prisma.OrderWhereInput;
  skip: number;
  take: number;
}): Promise<{ rows: Order[]; total: number }> {
  const where: Prisma.OrderWhereInput = { userId: args.userId, ...args.where };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({ where, skip: args.skip, take: args.take, orderBy: { createdAt: 'desc' } }),
    prisma.order.count({ where }),
  ]);
  return { rows, total };
}

export async function findByIdForUser(id: string, userId: string): Promise<Order | null> {
  return prisma.order.findFirst({ where: { id, userId } });
}
