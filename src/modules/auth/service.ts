import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { config } from '@config/index';
import { type Role } from '@constants/roles';
import { Errors } from '@utils/api-error';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@utils/jwt';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateRandomToken,
} from '@utils/password';
import * as authRepo from './repository';
import type {
  RegisterInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './validation';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  role: Role;
}

export interface AuthSessionResult {
  user: AuthUser;
  tokens: AuthTokens;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id.toString(),
    email: user.email,
    firstName: user.firstname,
    lastName: user.lastname,
    userName: user.username,
    role: user.role as Role,
  };
}

async function issueTokens(user: User): Promise<AuthTokens> {
  const userIdStr = user.id.toString();
  const refreshToken = signRefreshToken({ userId: userIdStr });
  const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
  if (!decoded?.exp) throw Errors.internal({ reason: 'refresh_token_missing_exp' });

  await authRepo.createRefreshToken({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: new Date(decoded.exp * 1000),
  });

  const accessToken = signAccessToken({ userId: userIdStr, role: user.role });
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthSessionResult> {
  if (await authRepo.findUserByEmail(input.email)) throw Errors.emailInUse();
  if (input.userName && (await authRepo.findUserByUsername(input.userName))) {
    throw Errors.conflict({ field: 'userName' });
  }

  const passwordHash = await hashPassword(input.password);
  const user = await authRepo.createUser({
    firstname: input.firstName,
    lastname: input.lastName,
    username: input.userName,
    email: input.email,
    password: passwordHash,
    role: input.role,
  });

  const tokens = await issueTokens(user);
  return { user: toAuthUser(user), tokens };
}

export async function login(input: LoginInput): Promise<AuthSessionResult> {
  const user = await authRepo.findUserByEmail(input.email);
  if (!user || !user.password) throw Errors.invalidCredentials();
  if (!user.status) throw Errors.forbidden({ reason: 'account_disabled' });

  const ok = await verifyPassword(user.password, input.password);
  if (!ok) throw Errors.invalidCredentials();

  const tokens = await issueTokens(user);
  return { user: toAuthUser(user), tokens };
}

export async function logout(input: LogoutInput): Promise<void> {
  // Idempotent: invalid/expired tokens silently succeed.
  try {
    verifyRefreshToken(input.refreshToken);
    const tokenHash = hashToken(input.refreshToken);
    await authRepo.revokeRefreshTokenByHash(tokenHash);
  } catch {
    // swallow — logging out an invalid token is not an error
  }
}

export async function refreshTokens(input: RefreshTokenInput): Promise<AuthTokens> {
  const payload = verifyRefreshToken(input.refreshToken);
  const tokenHash = hashToken(input.refreshToken);
  const row = await authRepo.findActiveRefreshTokenByHash(tokenHash);

  if (!row) {
    // Token verifies cryptographically but isn't in the DB — likely already
    // rotated/revoked. Treat as compromise: nuke every session for this user.
    try {
      await authRepo.revokeAllRefreshTokensForUser(BigInt(payload.sub));
    } catch {
      // best-effort
    }
    throw Errors.invalidToken();
  }

  const user = await authRepo.findUserById(row.user_id);
  if (!user || !user.status) throw Errors.invalidToken();

  const newTokens = await issueTokens(user);
  const newHash = hashToken(newTokens.refreshToken);
  const newRow = await authRepo.findRefreshTokenByHash(newHash);
  await authRepo.revokeRefreshToken(row.id, newRow?.id);

  return newTokens;
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<{ resetToken?: string }> {
  const user = await authRepo.findUserByEmail(input.email);
  // Generic shape so callers can't enumerate emails.
  if (!user) return {};

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  await authRepo.upsertPasswordResetToken(input.email, tokenHash);

  // Production: token is delivered via email and never returned in the API response.
  // Dev/test: we surface it so the flow can be exercised end-to-end.
  return config.isProduction ? {} : { resetToken: rawToken };
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(input.token);
  const row = await authRepo.findPasswordResetToken(
    input.email,
    tokenHash,
    config.passwordReset.ttlMinutes,
  );
  if (!row) throw Errors.invalidToken();

  const user = await authRepo.findUserByEmail(input.email);
  if (!user) throw Errors.invalidToken();

  const passwordHash = await hashPassword(input.password);
  await authRepo.updateUserPassword(user.id, passwordHash);
  await authRepo.deletePasswordResetTokens(input.email);

  // Force re-login on every existing session.
  await authRepo.revokeAllRefreshTokensForUser(user.id);
}
