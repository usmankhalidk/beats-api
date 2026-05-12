import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import * as dashboardService from './service';
import type { EarningsQuery, SalesQuery } from './validation';

function requireProducerId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function earnings(req: Request, res: Response): Promise<Response> {
  const { items, meta, totalAmount } = await dashboardService.getEarnings(
    requireProducerId(req),
    req.query as unknown as EarningsQuery,
  );
  return successResponse(res, { data: items, meta: { ...meta, totalAmount } });
}

export async function sales(req: Request, res: Response): Promise<Response> {
  const { items, meta } = await dashboardService.getSales(
    requireProducerId(req),
    req.query as unknown as SalesQuery,
  );
  return successResponse(res, { data: items, meta });
}
