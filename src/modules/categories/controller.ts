import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import * as categoriesService from './service';
import type { CategoryBeatsQuery } from './validation';

export async function list(_req: Request, res: Response): Promise<Response> {
  const data = await categoriesService.listCategories();
  return successResponse(res, { data });
}

export async function listBeats(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await categoriesService.listCategoryBeats(
    req.params.slug as string,
    req.query as unknown as CategoryBeatsQuery,
  );
  return successResponse(res, { data: items, meta: { ...meta } });
}
