import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import * as purchasesService from './service';
import type { ListPurchasesQuery } from './validation';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function list(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await purchasesService.listPurchases(
    requireUserId(req),
    req.query as unknown as ListPurchasesQuery,
  );
  return successResponse(res, { data: items, meta });
}

export async function get(req: Request, res: Response): Promise<Response> {
  const data = await purchasesService.getPurchase(requireUserId(req), String(req.params['id']));
  return successResponse(res, { data });
}
