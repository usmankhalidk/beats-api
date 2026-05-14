import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import { listBeatsByCategoryId, type BeatDTO } from '@modules/beats/service';
import * as categoriesRepo from './repository';
import type { CategoryBeatsQuery } from './validation';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  description: string | null;
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

export async function listCategoryBeats(
  slug: string,
  query: CategoryBeatsQuery,
): Promise<{ items: BeatDTO[]; meta: PaginationMeta }> {
  const category = await categoriesRepo.findBySlug(slug);
  if (!category) throw Errors.notFound({ resource: 'category' });
  return listBeatsByCategoryId(category.id, query);
}
