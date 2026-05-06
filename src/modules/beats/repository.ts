import type { Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

// Only expose status=1 (approved/active) items
const PUBLISHED: Prisma.itemsWhereInput = { status: 1 };

const INCLUDE = {
  users: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      avatar: true,
    },
  },
  categories: {
    select: { id: true, name: true, slug: true },
  },
  sub_categories: {
    select: { id: true, name: true, slug: true },
  },
} as const;

export type ItemWithRelations = Prisma.itemsGetPayload<{ include: typeof INCLUDE }>;

function sortOrder(sort: string): Prisma.itemsOrderByWithRelationInput {
  switch (sort) {
    case 'oldest':    return { created_at: 'asc' };
    case 'priceAsc':  return { regular_price: 'asc' };
    case 'priceDesc': return { regular_price: 'desc' };
    case 'bpmAsc':    return { bpm: 'asc' };
    case 'bpmDesc':   return { bpm: 'desc' };
    default:          return { created_at: 'desc' }; // newest
  }
}

export async function findById(id: bigint): Promise<ItemWithRelations | null> {
  return prisma.items.findFirst({
    where: { id, ...PUBLISHED },
    include: INCLUDE,
  });
}

export async function list(args: {
  where: Prisma.itemsWhereInput;
  sort: string;
  skip: number;
  take: number;
}): Promise<{ rows: ItemWithRelations[]; total: number }> {
  const where: Prisma.itemsWhereInput = { ...PUBLISHED, ...args.where };
  const orderBy = sortOrder(args.sort);
  const [rows, total] = await Promise.all([
    prisma.items.findMany({ where, orderBy, skip: args.skip, take: args.take, include: INCLUDE }),
    prisma.items.count({ where }),
  ]);
  return { rows, total };
}
