import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { loadEnv } from '../src/shared/config/env';
import { seedPaymentGateways } from './seeds/payment-gateways';
import { seedCurrencies } from './seeds/currencies';

loadEnv();

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@beats.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Platform Admin';
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';

async function seedAdmin(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`[seed] Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const password = await argon2.hash(ADMIN_PASSWORD, { type: argon2.argon2id });
  const [firstname, ...rest] = ADMIN_NAME.trim().split(/\s+/);
  const lastname = rest.join(' ') || null;
  const now = new Date();

  await prisma.user.create({
    data: {
      firstname: firstname ?? 'Platform',
      lastname,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password,
      role: 'admin',
      email_verified_at: now, // verified so the admin can log in immediately
      status: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`[seed] Created admin: ${ADMIN_EMAIL} (role=admin, password from SEED_ADMIN_PASSWORD)`);
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedCurrencies();
  await seedPaymentGateways();
}

main()
  .catch((err) => {
    console.error('[seed] failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
