import { PrismaClient, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { loadEnv } from '../src/shared/config/env';

loadEnv();

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@beats.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Platform Admin';

async function seedAdmin(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`[seed] Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const password = await argon2.hash(ADMIN_PASSWORD, { type: argon2.argon2id });

  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password,
      role: UserRole.admin,
      emailVerified: true,
    },
  });

  console.log(`[seed] Created admin: ${ADMIN_EMAIL}`);
}

async function main(): Promise<void> {
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error('[seed] failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
