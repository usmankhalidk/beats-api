import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import * as downloadsService from './service';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await downloadsService.getDownloadGrant(requireUserId(req), String(req.params['id']));
  return successResponse(res, { data });
}
