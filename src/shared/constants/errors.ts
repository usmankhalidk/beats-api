export const ERRORS = {
  NOT_FOUND: { code: 404, message: 'NOT_FOUND' },
  VALIDATION_ERROR: { code: 422, message: 'VALIDATION_ERROR' },
  UNAUTHORIZED: { code: 401, message: 'UNAUTHORIZED' },
  FORBIDDEN: { code: 403, message: 'FORBIDDEN' },
  CONFLICT: { code: 409, message: 'CONFLICT' },
  BAD_REQUEST: { code: 400, message: 'BAD_REQUEST' },
  TOO_MANY_REQUESTS: { code: 429, message: 'TOO_MANY_REQUESTS' },
  INTERNAL_ERROR: { code: 500, message: 'INTERNAL_ERROR' },
  NOT_IMPLEMENTED: { code: 501, message: 'NOT_IMPLEMENTED' },
  INVALID_CREDENTIALS: { code: 401, message: 'INVALID_CREDENTIALS' },
  INVALID_TOKEN: { code: 401, message: 'INVALID_TOKEN' },
  TOKEN_EXPIRED: { code: 401, message: 'TOKEN_EXPIRED' },
  EMAIL_ALREADY_IN_USE: { code: 409, message: 'EMAIL_ALREADY_IN_USE' },
} as const;

export type ErrorKey = keyof typeof ERRORS;
export type ErrorDescriptor = (typeof ERRORS)[ErrorKey];
