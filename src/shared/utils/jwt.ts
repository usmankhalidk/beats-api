import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '@config/index';
import { Errors } from './api-error';

export type TokenType = 'access' | 'refresh';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export function signAccessToken(payload: { userId: string; role: string }): string {
  const opts: SignOptions = { expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(
    { sub: payload.userId, role: payload.role, type: 'access' },
    config.jwt.accessSecret,
    opts,
  );
}

export function signRefreshToken(payload: { userId: string; jti: string }): string {
  const opts: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(
    { sub: payload.userId, jti: payload.jti, type: 'refresh' },
    config.jwt.refreshSecret,
    opts,
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
    if (decoded.type !== 'access') throw Errors.invalidToken();
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw Errors.tokenExpired();
    throw Errors.invalidToken();
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
    if (decoded.type !== 'refresh') throw Errors.invalidToken();
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw Errors.tokenExpired();
    throw Errors.invalidToken();
  }
}
