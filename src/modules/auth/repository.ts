import type { Prisma, RefreshToken, User } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
  return prisma.refreshToken.create({ data });
}

export async function findRefreshTokenById(id: string): Promise<RefreshToken | null> {
  return prisma.refreshToken.findUnique({ where: { id } });
}

export async function deleteRefreshTokenById(id: string): Promise<void> {
  await prisma.refreshToken.delete({ where: { id } }).catch(() => undefined);
}

export async function deleteRefreshTokensByUserId(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function findUserByPasswordResetToken(tokenHash: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpiresAt: { gt: new Date() },
    },
  });
}
