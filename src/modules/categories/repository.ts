import type { Category, Prisma } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function listAll(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function findBySlug(slug: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { slug } });
}

export async function findById(id: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { id } });
}

/** True when another category already uses this slug (optionally excluding one id). */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.category.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return found !== null;
}

export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
  let slug = base;
  let counter = 1;
  while (await slugExists(slug, excludeId)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
  return prisma.category.create({ data });
}

export async function update(id: string, data: Prisma.CategoryUncheckedUpdateInput): Promise<Category> {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteById(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

/** Counts of records that would be cascade-deleted with the category. */
export async function dependentCounts(id: string): Promise<{ items: number; subCategories: number }> {
  const [items, subCategories] = await Promise.all([
    prisma.items.count({ where: { category_id: id } }),
    prisma.sub_categories.count({ where: { category_id: id } }),
  ]);
  return { items, subCategories };
}
