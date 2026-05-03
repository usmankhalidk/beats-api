import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

function fileIfExists(p: string): string | undefined {
  return fs.existsSync(p) ? p : undefined;
}

/**
 * Load env files in priority order (last wins is reversed by dotenv: first wins).
 * Order:
 *   1. .env.{NODE_ENV}.local   (local overrides — never committed)
 *   2. .env.local              (generic local overrides — never committed)
 *   3. .env.{NODE_ENV}         (committed per-env defaults)
 *   4. .env                    (fallback / shared defaults)
 */
export function loadEnv(): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  const candidates = [
    path.join(PROJECT_ROOT, `.env.${nodeEnv}.local`),
    path.join(PROJECT_ROOT, `.env.local`),
    path.join(PROJECT_ROOT, `.env.${nodeEnv}`),
    path.join(PROJECT_ROOT, `.env`),
  ];

  for (const file of candidates) {
    const exists = fileIfExists(file);
    if (exists) {
      dotenv.config({ path: exists, override: false });
    }
  }
}
