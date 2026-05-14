import type { Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

const ITEM_INCLUDE = {
  users: {
    select: { id: true, firstname: true, lastname: true, username: true, avatar: true },
  },
  categories: { select: { id: true, name: true, slug: true } },
  sub_categories: { select: { id: true, name: true, slug: true } },
} as const;

const FAVORITE_INCLUDE = {
  items: { include: ITEM_INCLUDE },
} as const;

export type FavoriteWithItem = Prisma.favoritesGetPayload<{ include: typeof FAVORITE_INCLUDE }>;

export async function listForUser(userId: string): Promise<FavoriteWithItem[]> {
  return prisma.favorites.findMany({
    where: { user_id: userId },
    include: FAVORITE_INCLUDE,
    orderBy: { created_at: 'desc' },
  });
}

export async function findByUserAndBeat(userId: string, beatId: string) {
  return prisma.favorites.findFirst({ where: { user_id: userId, item_id: beatId } });
}

export async function add(userId: string, beatId: string): Promise<FavoriteWithItem> {
  return prisma.favorites.create({
    data: { user_id: userId, item_id: beatId },
    include: FAVORITE_INCLUDE,
  });
}

export async function removeByBeat(userId: string, beatId: string): Promise<number> {
  const { count } = await prisma.favorites.deleteMany({
    where: { user_id: userId, item_id: beatId },
  });
  return count;
}

export async function findPublishedBeat(beatId: string) {
  return prisma.items.findFirst({ where: { id: beatId, status: 1 }, select: { id: true } });
}
