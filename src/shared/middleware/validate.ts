import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { Errors } from '@utils/api-error';

export type ValidationTarget = 'body' | 'query' | 'params';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

function toFieldErrors(err: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_root';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
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
        next(Errors.validation(undefined, toFieldErrors(err)));
        return;
      }
      next(err);
    }
  };
}
