import type { Category } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function listAll(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function findBySlug(slug: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { slug } });
}
