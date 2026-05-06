import type { Prisma, User } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: BigInt(id) } });
}

export async function findByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username } });
}

export async function update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id: BigInt(id) }, data });
}
