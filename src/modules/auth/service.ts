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
  generateVerificationCode,
} from '@utils/password';
import { sendVerificationEmail, sendPasswordResetEmail } from '@utils/mailer';
import { verifyGoogleIdToken } from '@shared/oauth/google';
import * as authRepo from './repository';
import type {
  RegisterInput,
  LoginInput,
  GoogleSignInInput,
  LogoutInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
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
    id: user.id,
    email: user.email,
    firstName: user.firstname,
    lastName: user.lastname,
    userName: user.username,
    role: user.role as Role,
  };
}

async function issueTokens(user: User): Promise<AuthTokens> {
  const userIdStr = user.id;
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

export async function register(
  input: RegisterInput,
): Promise<{ verificationToken?: string }> {
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

  const rawCode = generateVerificationCode();
  await authRepo.upsertVerificationToken(user.id, hashToken(rawCode));
  await sendVerificationEmail(input.email, rawCode);

  return config.isProduction ? {} : { verificationCode: rawCode };
}

export async function login(input: LoginInput): Promise<AuthSessionResult> {
  const user = await authRepo.findUserByEmail(input.email);
  if (!user || !user.password) throw Errors.invalidCredentials();
  if (!user.status) throw Errors.forbidden({ reason: 'account_disabled' });

  const ok = await verifyPassword(user.password, input.password);
  if (!ok) throw Errors.invalidCredentials();

  if (!user.email_verified_at) throw Errors.forbidden({ reason: 'email_not_verified' });

  const tokens = await issueTokens(user);
  return { user: toAuthUser(user), tokens };
}

/**
 * Sign in (or transparently sign up) with a Google ID token. Resolution order:
 *   1. A user already linked to this Google account → sign in.
 *   2. A user with the same email → link the Google account, then sign in
 *      (so password and Google sign-in share one account).
 *   3. Otherwise → provision a new account from the verified Google profile.
 * Email/password auth is untouched; Google users simply have no password set.
 */
export async function googleSignIn(input: GoogleSignInInput): Promise<AuthSessionResult> {
  const profile = await verifyGoogleIdToken(input.idToken);
  if (!profile.emailVerified) throw Errors.forbidden({ reason: 'google_email_not_verified' });

  let user = await authRepo.findUserByGoogleId(profile.googleId);

  if (!user) {
    const existing = await authRepo.findUserByEmail(profile.email);
    if (existing) {
      // Link Google to the existing account; verify the email if Google did and
      // it wasn't already (never overwrites an existing verification timestamp).
      user = await authRepo.linkGoogleAccount(
        existing.id,
        profile.googleId,
        !existing.email_verified_at,
      );
    } else {
      user = await authRepo.createUser({
        firstname: profile.firstName,
        lastname: profile.lastName,
        email: profile.email,
        google_id: profile.googleId,
        avatar: profile.picture,
        role: input.role,
        // Google has verified ownership, so the account is usable immediately.
        email_verified_at: new Date(),
      });
    }
  }

  if (!user.status) throw Errors.forbidden({ reason: 'account_disabled' });

  const tokens = await issueTokens(user);
  return { user: toAuthUser(user), tokens };
}

export async function verifyEmail(code: string): Promise<AuthSessionResult> {
  const tokenHash = hashToken(code);
  const row = await authRepo.findVerificationByToken(tokenHash, config.emailVerification.ttlMinutes);
  if (!row) throw Errors.invalidToken();

  await authRepo.markEmailVerified(row.user_id);
  await authRepo.deleteVerificationToken(row.user_id);

  const tokens = await issueTokens(row.user);
  return { user: toAuthUser(row.user), tokens };
}

export async function resendVerification(
  email: string,
): Promise<{ verificationToken?: string }> {
  const user = await authRepo.findUserByEmail(email);
  if (!user) return {}; // silent — prevent email enumeration

  if (user.email_verified_at) throw Errors.conflict({ reason: 'already_verified' });

  const rawCode = generateVerificationCode();
  await authRepo.upsertVerificationToken(user.id, hashToken(rawCode));
  await sendVerificationEmail(email, rawCode);

  return config.isProduction ? {} : { verificationCode: rawCode };
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
      await authRepo.revokeAllRefreshTokensForUser(payload.sub);
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
  await sendPasswordResetEmail(input.email, rawToken);

  // Production: token is delivered via email only.
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

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<AuthTokens> {
  const user = await authRepo.findUserById(userId);
  if (!user || !user.password) throw Errors.invalidCredentials();

  const ok = await verifyPassword(user.password, input.currentPassword);
  if (!ok) throw Errors.invalidCredentials();

  const passwordHash = await hashPassword(input.newPassword);
  await authRepo.updateUserPassword(user.id, passwordHash);

  // Revoke every existing session, then issue a fresh pair so the caller stays signed in.
  await authRepo.revokeAllRefreshTokensForUser(user.id);
  return issueTokens(user);
}
