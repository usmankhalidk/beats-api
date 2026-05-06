import type { Prisma } from '@prisma/client';
import { Errors } from '@utils/api-error';
import { buildPaginationMeta, toPrismaSkipTake } from '@utils/pagination';
import type { PaginationMeta } from '@utils/pagination';
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
  preview_type: string;
  preview_image: string | null;
  preview_video: string | null;
  preview_audio: string | null;
  regular_price: number;
  extended_price: number;
  bpm: number | null;
  music_key: string | null;
  tags: string[];
  is_free: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_best_selling: boolean;
  is_premium: boolean;
  is_on_discount: boolean;
  purchasing_status: boolean;
  total_sales: number;
  total_reviews: number;
  avg_reviews: number;
  total_views: number;
  author: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    username: string | null;
    avatar: string | null;
  };
  category: { id: string; name: string; slug: string };
  sub_category: { id: string; name: string; slug: string } | null;
  created_at: Date | null;
  updated_at: Date | null;
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
    id: item.id.toString(),
    name: item.name,
    slug: item.slug,
    description: item.description,
    thumbnail: item.thumbnail,
    preview_type: item.preview_type,
    preview_image: item.preview_image,
    preview_video: item.preview_video,
    preview_audio: item.preview_audio,
    regular_price: item.regular_price,
    extended_price: item.extended_price,
    bpm: item.bpm ?? null,
    music_key: item.music_key,
    tags: parseTags(item.tags),
    is_free: item.is_free ?? false,
    is_featured: item.is_featured,
    is_trending: item.is_trending,
    is_best_selling: item.is_best_selling,
    is_premium: item.is_premium,
    is_on_discount: item.is_on_discount,
    purchasing_status: item.purchasing_status,
    total_sales: Number(item.total_sales),
    total_reviews: Number(item.total_reviews),
    avg_reviews: Number(item.avg_reviews),
    total_views: Number(item.total_views),
    author: {
      id: item.users.id.toString(),
      firstname: item.users.firstname,
      lastname: item.users.lastname,
      username: item.users.username,
      avatar: item.users.avatar,
    },
    category: {
      id: item.categories.id.toString(),
      name: item.categories.name,
      slug: item.categories.slug,
    },
    sub_category: item.sub_categories
      ? {
          id: item.sub_categories.id.toString(),
          name: item.sub_categories.name,
          slug: item.sub_categories.slug,
        }
      : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
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
  is_featured?: boolean;
  is_free?: boolean;
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
  if (filters.is_featured !== undefined) AND.push({ is_featured: filters.is_featured });
  if (filters.is_free !== undefined) AND.push({ is_free: filters.is_free });

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
  const item = await beatsRepo.findById(BigInt(id));
  if (!item) throw Errors.notFound({ resource: 'beat' });
  return toDTO(item);
}

export async function listBeatsByCategoryId(
  categoryId: bigint,
  query: { page: number; limit: number; sort: string },
): Promise<BeatListResult> {
  return paginate({ category_id: categoryId }, query.sort, query);
}

// ── Write stubs (implemented with producer module) ───────────────────────────
export async function createBeat(_producerId: string, _input: CreateBeatInput): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.create' });
}

export async function replaceBeat(
  _producerId: string,
  _id: string,
  _input: ReplaceBeatInput,
): Promise<BeatDTO> {
  throw Errors.notImplemented({ feature: 'beats.replace' });
}

export async function deleteBeat(_producerId: string, _id: string): Promise<void> {
  throw Errors.notImplemented({ feature: 'beats.delete' });
}
