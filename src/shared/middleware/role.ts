import type { Request, Response, NextFunction } from 'express';
import { Errors } from '@utils/api-error';
import type { Role } from '@constants/roles';

export function requireRoles(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(Errors.unauthorized());
      return;
    }
    if (!allowed.includes(req.user.role)) {
      next(Errors.forbidden({ requiredRoles: allowed }));
      return;
    }
    next();
  };
}
