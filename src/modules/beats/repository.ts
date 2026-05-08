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

export async function findByIdForAuthor(
  id: bigint,
  authorId: bigint,
): Promise<{ id: bigint; main_file: string; thumbnail: string | null } | null> {
  return prisma.items.findFirst({
    where: { id, author_id: authorId },
    select: { id: true, main_file: true, thumbnail: true },
  });
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = base;
  let counter = 1;
  while (await prisma.items.findFirst({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function create(data: {
  author_id: bigint;
  name: string;
  slug: string;
  description: string;
  category_id: bigint;
  sub_category_id?: bigint;
  regular_price: number;
  extended_price: number;
  bpm?: number;
  music_key?: string;
  tags: string;
  thumbnail?: string;
  main_file: string;
  is_free: boolean;
}): Promise<ItemWithRelations> {
  return prisma.items.create({
    data: { ...data, preview_type: 'audio', status: 1 },
    include: INCLUDE,
  });
}

export async function update(
  id: bigint,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    category_id: bigint;
    sub_category_id: bigint | null;
    regular_price: number;
    extended_price: number;
    bpm: number | null;
    music_key: string | null;
    tags: string;
    thumbnail: string;
    main_file: string;
    is_free: boolean;
  }>,
): Promise<ItemWithRelations> {
  return prisma.items.update({ where: { id }, data, include: INCLUDE });
}

export async function deleteById(id: bigint): Promise<void> {
  await prisma.items.delete({ where: { id } });
}
