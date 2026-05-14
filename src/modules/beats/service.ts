import type { Prisma } from '@prisma/client';
import { Errors } from '@utils/api-error';
import { buildPaginationMeta, toPrismaSkipTake } from '@utils/pagination';
import type { PaginationMeta } from '@utils/pagination';
import * as storage from '@utils/storage';
import * as beatsRepo from './repository';
import type { ItemWithRelations } from './repository';
import type {
  CreateBeatInput,
  FeaturedBeatsQuery,
  FilterBeatsQuery,
  FreeBeatsQuery,
  ListBeatsQuery,
  ReplaceBeatInput,
  SearchBeatsQuery,
} from './validation';

export interface BeatDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  previewType: string;
  previewImage: string | null;
  previewVideo: string | null;
  previewAudio: string | null;
  regularPrice: number;
  extendedPrice: number;
  bpm: number | null;
  musicKey: string | null;
  tags: string[];
  isFree: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSelling: boolean;
  isPremium: boolean;
  isOnDiscount: boolean;
  purchasingStatus: boolean;
  totalSales: number;
  totalReviews: number;
  avgReviews: number;
  totalViews: number;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    userName: string | null;
    avatar: string | null;
  };
  category: { id: string; name: string; slug: string };
  subCategory: { id: string; name: string; slug: string } | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type BeatListResult = { items: BeatDTO[]; meta: PaginationMeta };

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return raw.split(',').map((t) => t.trim()).filter(Boolean);
  }
}

export function toDTO(item: ItemWithRelations): BeatDTO {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    thumbnail: item.thumbnail,
    previewType: item.preview_type,
    previewImage: item.preview_image,
    previewVideo: item.preview_video,
    previewAudio: item.preview_audio,
    regularPrice: item.regular_price,
    extendedPrice: item.extended_price,
    bpm: item.bpm ?? null,
    musicKey: item.music_key,
    tags: parseTags(item.tags),
    isFree: item.is_free ?? false,
    isFeatured: item.is_featured,
    isTrending: item.is_trending,
    isBestSelling: item.is_best_selling,
    isPremium: item.is_premium,
    isOnDiscount: item.is_on_discount,
    purchasingStatus: item.purchasing_status,
    totalSales: Number(item.total_sales),
    totalReviews: Number(item.total_reviews),
    avgReviews: Number(item.avg_reviews),
    totalViews: Number(item.total_views),
    author: {
      id: item.users.id,
      firstName: item.users.firstname,
      lastName: item.users.lastname,
      userName: item.users.username,
      avatar: item.users.avatar,
    },
    category: {
      id: item.categories.id,
      name: item.categories.name,
      slug: item.categories.slug,
    },
    subCategory: item.sub_categories
      ? {
          id: item.sub_categories.id,
          name: item.sub_categories.name,
          slug: item.sub_categories.slug,
        }
      : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function buildWhere(filters: {
  q?: string;
  bpm?: number;
  tag?: string;
  category?: string;
  subCategory?: string;
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
  isFeatured?: boolean;
}): Prisma.itemsWhereInput {
  const AND: Prisma.itemsWhereInput[] = [];

  if (filters.q) {
    AND.push({
      OR: [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
        { tags: { contains: filters.q } },
      ],
    });
  }
  if (filters.bpm !== undefined) AND.push({ bpm: filters.bpm });
  if (filters.tag) AND.push({ tags: { contains: filters.tag } });
  if (filters.category) AND.push({ categories: { slug: filters.category } });
  if (filters.subCategory) AND.push({ sub_categories: { slug: filters.subCategory } });
  if (filters.priceMin !== undefined) AND.push({ regular_price: { gte: filters.priceMin } });
  if (filters.priceMax !== undefined) AND.push({ regular_price: { lte: filters.priceMax } });
  if (filters.isFree !== undefined) AND.push({ is_free: filters.isFree });
  if (filters.isFeatured !== undefined) AND.push({ is_featured: filters.isFeatured });

  return AND.length > 0 ? { AND } : {};
}

async function paginate(
  where: Prisma.itemsWhereInput,
  sort: string,
  query: { page: number; limit: number },
): Promise<BeatListResult> {
  const { skip, take } = toPrismaSkipTake(query);
  const { rows, total } = await beatsRepo.list({ where, sort, skip, take });
  return {
    items: rows.map(toDTO),
    meta: buildPaginationMeta({ page: query.page, limit: query.limit, total }),
  };
}

export async function listBeats(query: ListBeatsQuery): Promise<BeatListResult> {
  return paginate({}, query.sort, query);
}

export async function searchBeats(query: SearchBeatsQuery): Promise<BeatListResult> {
  return paginate(buildWhere({ q: query.q, bpm: query.bpm, tag: query.tag }), query.sort, query);
}

export async function filterBeats(query: FilterBeatsQuery): Promise<BeatListResult> {
  return paginate(
    buildWhere({
      category: query.category,
      subCategory: query.subCategory,
      priceMin: query.priceMin,
      priceMax: query.priceMax,
      isFree: query.isFree,
    }),
    query.sort,
    query,
  );
}

export async function featuredBeats(query: FeaturedBeatsQuery): Promise<BeatListResult> {
  return paginate({ is_featured: true }, 'newest', query);
}

export async function freeBeats(query: FreeBeatsQuery): Promise<BeatListResult> {
  return paginate({ is_free: true }, 'newest', query);
}

export async function getBeat(id: string): Promise<BeatDTO> {
  const item = await beatsRepo.findById(id);
  if (!item) throw Errors.notFound({ resource: 'beat' });
  return toDTO(item);
}

export async function listBeatsByCategoryId(
  categoryId: string,
  query: { page: number; limit: number; sort: string },
): Promise<BeatListResult> {
  return paginate({ category_id: categoryId }, query.sort, query);
}

// ── Write operations (producer module) ──────────────────────────────────────

export interface BeatFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export async function createBeat(
  producerId: string,
  input: CreateBeatInput,
  beatFile: BeatFileInput,
  coverFile?: BeatFileInput,
): Promise<BeatDTO> {
  const slug = await beatsRepo.generateUniqueSlug(input.title);
  const item = await beatsRepo.create({
    author_id: producerId,
    name: input.title,
    slug,
    description: input.description ?? '',
    category_id: input.categoryId,
    sub_category_id: input.subCategoryId ? input.subCategoryId : undefined,
    regular_price: parseFloat(input.regularPrice),
    extended_price: parseFloat(input.extendedPrice),
    bpm: input.bpm,
    music_key: input.musicKey,
    tags: JSON.stringify(input.tags ?? []),
    is_free: input.isFree,
    main_file: 'pending',
  });

  const itemId = item.id;
  try {
    const beatKey = await storage.uploadBeatFile(beatFile.buffer, beatFile.originalname, beatFile.mimetype, itemId);
    let thumbnail: string | undefined;
    if (coverFile) {
      thumbnail = await storage.uploadCoverImage(coverFile.buffer, coverFile.originalname, coverFile.mimetype, itemId);
    }
    const updated = await beatsRepo.update(item.id, { main_file: beatKey, thumbnail });
    return toDTO(updated);
  } catch (err) {
    await beatsRepo.deleteById(item.id).catch(() => {});
    throw err;
  }
}

export async function replaceBeat(
  producerId: string,
  id: string,
  input: ReplaceBeatInput,
  beatFile?: BeatFileInput,
  coverFile?: BeatFileInput,
): Promise<BeatDTO> {
  const existing = await beatsRepo.findByIdForAuthor(id, producerId);
  if (!existing) throw Errors.notFound({ resource: 'beat' });

  const slug = await beatsRepo.generateUniqueSlug(input.title);
  const updateData: Parameters<typeof beatsRepo.update>[1] = {
    name: input.title,
    slug,
    description: input.description ?? '',
    category_id: input.categoryId,
    sub_category_id: input.subCategoryId ? input.subCategoryId : null,
    regular_price: parseFloat(input.regularPrice),
    extended_price: parseFloat(input.extendedPrice),
    bpm: input.bpm ?? null,
    music_key: input.musicKey ?? null,
    tags: JSON.stringify(input.tags ?? []),
    is_free: input.isFree,
  };

  if (beatFile) {
    updateData.main_file = await storage.uploadBeatFile(beatFile.buffer, beatFile.originalname, beatFile.mimetype, id);
  }
  if (coverFile) {
    if (existing.thumbnail) await storage.deleteCoverImage(existing.thumbnail).catch(() => {});
    updateData.thumbnail = await storage.uploadCoverImage(coverFile.buffer, coverFile.originalname, coverFile.mimetype, id);
  }

  const updated = await beatsRepo.update(id, updateData);
  return toDTO(updated);
}

export async function deleteBeat(producerId: string, id: string): Promise<void> {
  const existing = await beatsRepo.findByIdForAuthor(id, producerId);
  if (!existing) throw Errors.notFound({ resource: 'beat' });
  await Promise.all([
    storage.deleteBeatFile(existing.main_file).catch(() => {}),
    existing.thumbnail ? storage.deleteCoverImage(existing.thumbnail).catch(() => {}) : Promise.resolve(),
  ]);
  await beatsRepo.deleteById(id);
}
