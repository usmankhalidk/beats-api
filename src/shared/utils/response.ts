import type { Response } from 'express';
import { HTTP_STATUS } from '@constants/http-status';

export interface SuccessEnvelope<T> {
  success: true;
  code: number;
  message: string;
  data: T;
  meta?: object;
}

export interface ErrorEnvelope {
  success: false;
  code: number;
  message: string;
  details?: Record<string, unknown>;
}

export function successResponse<T>(
  res: Response,
  payload: {
    data: T;
    message?: string;
    code?: number;
    meta?: object;
  },
): Response {
  const code = payload.code ?? HTTP_STATUS.OK;
  const body: SuccessEnvelope<T> = {
    success: true,
    code,
    message: payload.message ?? 'OK',
    data: payload.data,
    ...(payload.meta ? { meta: payload.meta } : {}),
  };
  return res.status(code).json(body);
}

export function errorResponse(
  res: Response,
  payload: { code: number; message: string; details?: Record<string, unknown> },
): Response {
  const body: ErrorEnvelope = {
    success: false,
    code: payload.code,
    message: payload.message,
    ...(payload.details ? { details: payload.details } : {}),
  };
  return res.status(payload.code).json(body);
}
