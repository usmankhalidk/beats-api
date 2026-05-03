import { ERRORS, ErrorDescriptor } from '@constants/errors';

export interface ApiErrorShape {
  code: number;
  message: string;
  details?: Record<string, unknown>;
  isOperational: true;
}

/**
 * Functional error factory — no class, but instances are detectable via the
 * `isApiError` symbol so the global error handler can branch on shape.
 */
export const API_ERROR_SYMBOL = Symbol.for('beats-api.ApiError');

export interface ApiError extends Error, ApiErrorShape {
  [API_ERROR_SYMBOL]: true;
}

export function createApiError(
  descriptor: ErrorDescriptor,
  options?: { details?: Record<string, unknown>; cause?: unknown },
): ApiError {
  const err = new Error(descriptor.message) as ApiError;
  err.name = 'ApiError';
  err.code = descriptor.code;
  err.message = descriptor.message;
  err.isOperational = true;
  err[API_ERROR_SYMBOL] = true;
  if (options?.details) err.details = options.details;
  if (options?.cause !== undefined) (err as Error & { cause?: unknown }).cause = options.cause;
  return err;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[API_ERROR_SYMBOL] === true
  );
}

export const Errors = {
  notFound: (details?: Record<string, unknown>) => createApiError(ERRORS.NOT_FOUND, { details }),
  validation: (details?: Record<string, unknown>) => createApiError(ERRORS.VALIDATION_ERROR, { details }),
  unauthorized: (details?: Record<string, unknown>) => createApiError(ERRORS.UNAUTHORIZED, { details }),
  forbidden: (details?: Record<string, unknown>) => createApiError(ERRORS.FORBIDDEN, { details }),
  conflict: (details?: Record<string, unknown>) => createApiError(ERRORS.CONFLICT, { details }),
  badRequest: (details?: Record<string, unknown>) => createApiError(ERRORS.BAD_REQUEST, { details }),
  tooManyRequests: (details?: Record<string, unknown>) => createApiError(ERRORS.TOO_MANY_REQUESTS, { details }),
  internal: (details?: Record<string, unknown>) => createApiError(ERRORS.INTERNAL_ERROR, { details }),
  notImplemented: (details?: Record<string, unknown>) => createApiError(ERRORS.NOT_IMPLEMENTED, { details }),
  invalidCredentials: () => createApiError(ERRORS.INVALID_CREDENTIALS),
  invalidToken: () => createApiError(ERRORS.INVALID_TOKEN),
  tokenExpired: () => createApiError(ERRORS.TOKEN_EXPIRED),
  emailInUse: () => createApiError(ERRORS.EMAIL_ALREADY_IN_USE),
};
