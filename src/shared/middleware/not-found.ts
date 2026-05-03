import type { Request, Response, NextFunction } from 'express';
import { Errors } from '@utils/api-error';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(Errors.notFound({ method: req.method, path: req.originalUrl }));
}
