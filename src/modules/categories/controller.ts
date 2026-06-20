import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { HTTP_STATUS } from '@constants/http-status';
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
  return successResponse(res, { data: items, meta });
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await categoriesService.getCategory(String(req.params['id']));
  return successResponse(res, { data });
}

export async function create(req: Request, res: Response): Promise<Response> {
  const data = await categoriesService.createCategory(req.body);
  return successResponse(res, { data, message: 'CATEGORY_CREATED', code: HTTP_STATUS.CREATED });
}

export async function update(req: Request, res: Response): Promise<Response> {
  const data = await categoriesService.updateCategory(String(req.params['id']), req.body);
  return successResponse(res, { data, message: 'CATEGORY_UPDATED' });
}

export async function remove(req: Request, res: Response): Promise<Response> {
  await categoriesService.deleteCategory(String(req.params['id']));
  return successResponse(res, { data: { id: String(req.params['id']) }, message: 'CATEGORY_DELETED' });
}
