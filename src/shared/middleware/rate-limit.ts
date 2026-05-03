import rateLimit, { Options } from 'express-rate-limit';
import { config } from '@config/index';
import { ERRORS } from '@constants/errors';

const baseHandler: Options['handler'] = (_req, res) => {
  res.status(ERRORS.TOO_MANY_REQUESTS.code).json({
    success: false,
    code: ERRORS.TOO_MANY_REQUESTS.code,
    message: ERRORS.TOO_MANY_REQUESTS.message,
  });
};

export function makeRateLimiter(overrides: Partial<Options> = {}) {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: baseHandler,
    ...overrides,
  });
}

/** Default global limiter — applied app-wide. */
export const globalRateLimiter = makeRateLimiter();

/** Stricter limiter for auth endpoints (login, register, refresh, password reset). */
export const authRateLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
