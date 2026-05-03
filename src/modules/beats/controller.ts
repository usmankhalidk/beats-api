import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as beatsService from './service';
import type { ListBeatsQuery } from './validation';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await beatsService.listBeats(req.query as unknown as ListBeatsQuery);
  return successResponse(res, { data: items, meta });
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await beatsService.getBeat(req.params.id);
  return successResponse(res, { data });
}

export async function create(req: Request, res: Response): Promise<Response> {
  const data = await beatsService.createBeat(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'BEAT_CREATED', code: HTTP_STATUS.CREATED });
}

export async function update(req: Request, res: Response): Promise<Response> {
  const data = await beatsService.updateBeat(requireUserId(req), req.params.id, req.body);
  return successResponse(res, { data, message: 'BEAT_UPDATED' });
}

export async function remove(req: Request, res: Response): Promise<Response> {
  await beatsService.deleteBeat(requireUserId(req), req.params.id);
  return successResponse(res, { data: null, message: 'BEAT_DELETED' });
}
