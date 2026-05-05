import type { Download } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function findByIdForUser(id: string, userId: string): Promise<Download | null> {
  return prisma.download.findFirst({ where: { id, userId } });
}
