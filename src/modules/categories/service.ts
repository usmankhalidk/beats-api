import type { Category } from '@prisma/client';
import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import { listBeatsByCategoryId, type BeatDTO } from '@modules/beats/service';
import * as categoriesRepo from './repository';
import type { CategoryBeatsQuery, CreateCategoryInput, UpdateCategoryInput } from './validation';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  description: string | null;
}

export interface CategoryDetailDTO extends CategoryDTO {
  regularBuyerFee: number;
  extendedBuyerFee: number;
  fileType: boolean | null;
  thumbnailWidth: number;
  thumbnailHeight: number;
  previewImageWidth: number | null;
  previewImageHeight: number | null;
  maximumScreenshots: number | null;
  mainFileTypes: string;
  maxPreviewFileSize: number;
  views: number;
  sortId: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const bigToNum = (v: bigint | null): number | null => (v === null ? null : Number(v));

function mapCategoryDetail(c: Category): CategoryDetailDTO {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    title: c.title,
    description: c.description,
    regularBuyerFee: c.regular_buyer_fee ?? 0,
    extendedBuyerFee: c.extended_buyer_fee ?? 0,
    fileType: c.file_type,
    thumbnailWidth: Number(c.thumbnail_width),
    thumbnailHeight: Number(c.thumbnail_height),
    previewImageWidth: bigToNum(c.preview_image_width),
    previewImageHeight: bigToNum(c.preview_image_height),
    maximumScreenshots: bigToNum(c.maximum_screenshots),
    mainFileTypes: c.main_file_types,
    maxPreviewFileSize: Number(c.max_preview_file_size),
    views: Number(c.views),
    sortId: Number(c.sort_id),
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function listCategories(): Promise<CategoryDTO[]> {
  const cats = await categoriesRepo.listAll();
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    title: c.title,
    description: c.description,
  }));
}

export async function getCategory(id: string): Promise<CategoryDetailDTO> {
  const category = await categoriesRepo.findById(id);
  if (!category) throw Errors.notFound({ resource: 'category', id });
  return mapCategoryDetail(category);
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDetailDTO> {
  const slug = input.slug
    ? await ensureSlugAvailable(input.slug)
    : await categoriesRepo.generateUniqueSlug(input.name);

  const now = new Date();
  const created = await categoriesRepo.create({
    name: input.name,
    slug,
    title: input.title,
    description: input.description,
    regular_buyer_fee: input.regularBuyerFee,
    extended_buyer_fee: input.extendedBuyerFee,
    file_type: input.fileType,
    thumbnail_width: toBig(input.thumbnailWidth),
    thumbnail_height: toBig(input.thumbnailHeight),
    preview_image_width: toBig(input.previewImageWidth),
    preview_image_height: toBig(input.previewImageHeight),
    maximum_screenshots: toBig(input.maximumScreenshots),
    main_file_types: input.mainFileTypes,
    max_preview_file_size: toBig(input.maxPreviewFileSize),
    sort_id: toBig(input.sortId),
    created_at: now,
    updated_at: now,
  });
  return mapCategoryDetail(created);
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryDetailDTO> {
  const existing = await categoriesRepo.findById(id);
  if (!existing) throw Errors.notFound({ resource: 'category', id });

  const slug =
    input.slug !== undefined && input.slug !== existing.slug
      ? await ensureSlugAvailable(input.slug, id)
      : undefined;

  const updated = await categoriesRepo.update(id, {
    name: input.name,
    ...(slug !== undefined ? { slug } : {}),
    title: input.title,
    description: input.description,
    regular_buyer_fee: input.regularBuyerFee,
    extended_buyer_fee: input.extendedBuyerFee,
    file_type: input.fileType,
    thumbnail_width: toBig(input.thumbnailWidth),
    thumbnail_height: toBig(input.thumbnailHeight),
    preview_image_width: toBig(input.previewImageWidth),
    preview_image_height: toBig(input.previewImageHeight),
    maximum_screenshots: toBig(input.maximumScreenshots),
    main_file_types: input.mainFileTypes,
    max_preview_file_size: toBig(input.maxPreviewFileSize),
    sort_id: toBig(input.sortId),
    updated_at: new Date(),
  });
  return mapCategoryDetail(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await categoriesRepo.findById(id);
  if (!existing) throw Errors.notFound({ resource: 'category', id });

  // Deleting cascades to items (beats) and sub_categories — refuse if any exist.
  const deps = await categoriesRepo.dependentCounts(id);
  if (deps.items > 0 || deps.subCategories > 0) {
    throw Errors.conflict({
      reason: 'category_in_use',
      items: deps.items,
      subCategories: deps.subCategories,
    });
  }
  await categoriesRepo.deleteById(id);
}

async function ensureSlugAvailable(slug: string, excludeId?: string): Promise<string> {
  if (await categoriesRepo.slugExists(slug, excludeId)) {
    throw Errors.conflict({ reason: 'slug_taken', slug });
  }
  return slug;
}

const toBig = (v: number | undefined): bigint | undefined => (v === undefined ? undefined : BigInt(v));

export async function listCategoryBeats(
  slug: string,
  query: CategoryBeatsQuery,
): Promise<{ items: BeatDTO[]; meta: PaginationMeta }> {
  const category = await categoriesRepo.findBySlug(slug);
  if (!category) throw Errors.notFound({ resource: 'category' });
  return listBeatsByCategoryId(category.id, query);
}
