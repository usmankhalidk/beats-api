import { Errors } from '@utils/api-error';
import type { PaginationMeta } from '@utils/pagination';
import type { BeatDTO } from '@modules/beats/service';
import type { CategoryBeatsQuery } from './validation';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
}

export async function listCategories(): Promise<CategoryDTO[]> {
  throw Errors.notImplemented({ feature: 'categories.list' });
}

export async function listCategoryBeats(
  _slug: string,
  _query: CategoryBeatsQuery,
): Promise<{ items: BeatDTO[]; meta: PaginationMeta }> {
  throw Errors.notImplemented({ feature: 'categories.beats' });
}
