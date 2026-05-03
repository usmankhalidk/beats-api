import type { Beat, Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

/** Soft-delete-aware default filter — excludes deleted beats. */
export const ACTIVE_BEAT_WHERE: Prisma.BeatWhereInput = { deletedAt: null };

export async function findById(id: string, opts?: { includeDeleted?: boolean }): Promise<Beat | null> {
  return prisma.beat.findFirst({
    where: { id, ...(opts?.includeDeleted ? {} : ACTIVE_BEAT_WHERE) },
  });
}

export async function list(args: {
  where: Prisma.BeatWhereInput;
  orderBy: Prisma.BeatOrderByWithRelationInput;
  skip: number;
  take: number;
}): Promise<{ rows: Beat[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.beat.findMany({
      where: { ...ACTIVE_BEAT_WHERE, ...args.where },
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
    }),
    prisma.beat.count({ where: { ...ACTIVE_BEAT_WHERE, ...args.where } }),
  ]);
  return { rows, total };
}

export async function create(data: Prisma.BeatCreateInput): Promise<Beat> {
  return prisma.beat.create({ data });
}

export async function update(id: string, data: Prisma.BeatUpdateInput): Promise<Beat> {
  return prisma.beat.update({ where: { id }, data });
}

export async function softDelete(id: string): Promise<Beat> {
  return prisma.beat.update({ where: { id }, data: { deletedAt: new Date() } });
}
