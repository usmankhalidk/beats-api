import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as cartService from './service';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const data = await cartService.listCart(requireUserId(req));
  return successResponse(res, { data });
}

export async function add(req: Request, res: Response): Promise<Response> {
  const data = await cartService.addItem(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'CART_ITEM_ADDED', code: HTTP_STATUS.CREATED });
}

export async function remove(req: Request, res: Response): Promise<Response> {
  await cartService.removeItem(requireUserId(req), req.params.id);
  return successResponse(res, { data: null, message: 'CART_ITEM_REMOVED' });
}

export async function clear(req: Request, res: Response): Promise<Response> {
  await cartService.clearCart(requireUserId(req));
  return successResponse(res, { data: null, message: 'CART_CLEARED' });
}
