import argon2 from 'argon2';
import crypto from 'node:crypto';

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRandomToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateVerificationCode(): string {
  // cryptographically secure 6-digit numeric code
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, '0');
}
