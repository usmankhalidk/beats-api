import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { Errors } from '@utils/api-error';

export type ValidationTarget = 'body' | 'query' | 'params';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

function formatZodError(err: ZodError): Record<string, unknown> {
  return {
    issues: err.issues.map((i) => ({
      path: i.path.join('.'),
      code: i.code,
      message: i.message,
    })),
  };
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.assign(req.query, parsed);
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.assign(req.params, parsed);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(Errors.validation(formatZodError(err)));
        return;
      }
      next(err);
    }
  };
}
