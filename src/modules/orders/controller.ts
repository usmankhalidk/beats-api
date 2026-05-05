import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import * as ordersService from './service';
import type { ListOrdersQuery } from './validation';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await ordersService.listOrders(
    requireUserId(req),
    req.query as unknown as ListOrdersQuery,
  );
  return successResponse(res, { data: items, meta });
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await ordersService.getOrder(requireUserId(req), req.params.id);
  return successResponse(res, { data });
}

export async function validate(req: Request, res: Response): Promise<Response> {
  const data = await ordersService.validateOrder(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'ORDER_VALIDATED' });
}

export async function checkout(req: Request, res: Response): Promise<Response> {
  const data = await ordersService.checkout(requireUserId(req), req.body);
  return successResponse(res, { data });
}
