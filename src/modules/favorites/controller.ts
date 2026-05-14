import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as favoritesService from './service';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const data = await favoritesService.listFavorites(requireUserId(req));
  return successResponse(res, { data });
}

export async function add(req: Request, res: Response): Promise<Response> {
  const data = await favoritesService.addFavorite(requireUserId(req), req.body.beatId);
  return successResponse(res, { data, message: 'FAVORITE_ADDED', code: HTTP_STATUS.CREATED });
}

export async function remove(req: Request, res: Response): Promise<Response> {
  await favoritesService.removeFavorite(requireUserId(req), String(req.params['beatId']));
  return successResponse(res, { data: null, message: 'FAVORITE_REMOVED' });
}
