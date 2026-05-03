import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import * as userService from './service';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function getMe(req: Request, res: Response): Promise<Response> {
  const data = await userService.getProfile(requireUserId(req));
  return successResponse(res, { data });
}

export async function updateMe(req: Request, res: Response): Promise<Response> {
  const data = await userService.updateProfile(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'PROFILE_UPDATED' });
}

export async function changePassword(req: Request, res: Response): Promise<Response> {
  await userService.changePassword(requireUserId(req), req.body);
  return successResponse(res, { data: null, message: 'PASSWORD_CHANGED' });
}
