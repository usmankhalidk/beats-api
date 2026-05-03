import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt';
import { Errors } from '@utils/api-error';
import type { Role } from '@constants/roles';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw Errors.unauthorized({ reason: 'missing_bearer_token' });
    }
    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role as Role };
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  try {
    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role as Role };
  } catch {
    // swallow — optional
  }
  next();
}
