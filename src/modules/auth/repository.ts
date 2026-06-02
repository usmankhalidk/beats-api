import type { Prisma, refresh_tokens, User } from '@prisma/client';
import { prisma } from '@utils/prisma-client';

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await prisma.user.update({ where: { id }, data: { password: passwordHash } });
}

export async function createRefreshToken(
  data: Prisma.refresh_tokensUncheckedCreateInput,
): Promise<refresh_tokens> {
  return prisma.refresh_tokens.create({ data });
}

export async function findActiveRefreshTokenById(id: string): Promise<refresh_tokens | null> {
  return prisma.refresh_tokens.findFirst({
    where: { id, revoked_at: null, expires_at: { gt: new Date() } },
  });
}

export async function findRefreshTokenByHash(tokenHash: string): Promise<refresh_tokens | null> {
  return prisma.refresh_tokens.findUnique({ where: { token_hash: tokenHash } });
}

export async function findActiveRefreshTokenByHash(
  tokenHash: string,
): Promise<refresh_tokens | null> {
  return prisma.refresh_tokens.findFirst({
    where: { token_hash: tokenHash, revoked_at: null, expires_at: { gt: new Date() } },
  });
}

export async function revokeRefreshTokenByHash(tokenHash: string): Promise<void> {
  await prisma.refresh_tokens.updateMany({
    where: { token_hash: tokenHash, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export async function revokeRefreshToken(id: string, replacedBy?: string): Promise<void> {
  await prisma.refresh_tokens
    .update({
      where: { id },
      data: { revoked_at: new Date(), replaced_by: replacedBy ?? null },
    })
    .catch(() => undefined);
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refresh_tokens.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

/**
 * Legacy `password_resets` has no primary key (Prisma `@@ignore`s it),
 * so we operate on it via raw SQL. Schema: (email VARCHAR, token VARCHAR, created_at TIMESTAMP).
 * Token is stored as SHA-256 hex of the raw token; one active row per email.
 */
export async function upsertPasswordResetToken(email: string, tokenHash: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM password_resets WHERE email = ${email}`;
  await prisma.$executeRaw`
    INSERT INTO password_resets (email, token, created_at) VALUES (${email}, ${tokenHash}, NOW())
  `;
}

export interface PasswordResetRow {
  email: string;
  token: string;
  created_at: Date;
}

export async function findPasswordResetToken(
  email: string,
  tokenHash: string,
  ttlMinutes: number,
): Promise<PasswordResetRow | null> {
  const rows = await prisma.$queryRaw<PasswordResetRow[]>`
    SELECT email, token, created_at FROM password_resets
    WHERE email = ${email} AND token = ${tokenHash}
      AND created_at > DATE_SUB(NOW(), INTERVAL ${ttlMinutes} MINUTE)
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function deletePasswordResetTokens(email: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM password_resets WHERE email = ${email}`;
}

// ─── Email verification tokens ────────────────────────────────────────────────

export async function upsertVerificationToken(userId: string, tokenHash: string): Promise<void> {
  await prisma.email_verifications.upsert({
    where: { user_id: userId },
    create: { user_id: userId, token: tokenHash, created_at: new Date() },
    update: { token: tokenHash, created_at: new Date() },
  });
}

export async function findVerificationByToken(
  tokenHash: string,
  ttlMinutes: number,
): Promise<{ id: string; user_id: string; user: User } | null> {
  const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);
  return prisma.email_verifications.findFirst({
    where: { token: tokenHash, created_at: { gt: cutoff } },
    select: { id: true, user_id: true, user: true },
  });
}

export async function deleteVerificationToken(userId: string): Promise<void> {
  await prisma.email_verifications.deleteMany({ where: { user_id: userId } });
}

export async function markEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { email_verified_at: new Date() } });
}
