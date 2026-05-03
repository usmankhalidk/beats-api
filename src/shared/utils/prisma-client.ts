import { PrismaClient } from '@prisma/client';
import { config } from '@config/index';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}
