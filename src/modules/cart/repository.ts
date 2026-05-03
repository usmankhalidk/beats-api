import type { CartItem, Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function listForUser(userId: string): Promise<CartItem[]> {
  return prisma.cartItem.findMany({ where: { userId } });
}

export async function add(data: Prisma.CartItemUncheckedCreateInput): Promise<CartItem> {
  return prisma.cartItem.create({ data });
}

export async function removeById(id: string, userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { id, userId } });
}

export async function clearForUser(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
