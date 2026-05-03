import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { isApiError } from '@utils/api-error';
import { errorResponse } from '@utils/response';
import { ERRORS } from '@constants/errors';
import { logger } from '@utils/logger';
import { config } from '@config/index';

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
  code: number;
  message: string;
  details?: Record<string, unknown>;
} {
  switch (err.code) {
    case 'P2002':
      return { code: ERRORS.CONFLICT.code, message: ERRORS.CONFLICT.message, details: { target: err.meta?.target } };
    case 'P2025':
      return { code: ERRORS.NOT_FOUND.code, message: ERRORS.NOT_FOUND.message };
    case 'P2003':
      return { code: ERRORS.BAD_REQUEST.code, message: ERRORS.BAD_REQUEST.message, details: { reason: 'foreign_key_violation' } };
    default:
      return { code: ERRORS.INTERNAL_ERROR.code, message: ERRORS.INTERNAL_ERROR.message, details: { prismaCode: err.code } };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (isApiError(err)) {
    errorResponse(res, { code: err.code, message: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    errorResponse(res, {
      code: ERRORS.VALIDATION_ERROR.code,
      message: ERRORS.VALIDATION_ERROR.message,
      details: { issues: err.issues },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(err);
    errorResponse(res, mapped);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse(res, {
      code: ERRORS.BAD_REQUEST.code,
      message: ERRORS.BAD_REQUEST.message,
      details: { reason: 'prisma_validation' },
    });
    return;
  }

  logger.error('unhandled error', {
    method: req.method,
    path: req.originalUrl,
    err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
  });

  errorResponse(res, {
    code: ERRORS.INTERNAL_ERROR.code,
    message: ERRORS.INTERNAL_ERROR.message,
    ...(config.isProduction
      ? {}
      : { details: { raw: err instanceof Error ? err.message : String(err) } }),
  });
}
