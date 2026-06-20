import { PrismaClient, Prisma } from '@prisma/client';
import { loadEnv } from '../../src/shared/config/env';

loadEnv();

const prisma = new PrismaClient();

/**
 * USD is the base pricing currency (rate = 1) — item prices are stored in it.
 * USD/EUR/GBP/JPY/CNY are DISPLAY currencies (what the buyer browses/checks out in).
 * NGN is the SETTLEMENT currency — every payment is charged in NGN regardless of
 * the display currency. Each `rate` is "units of this currency per 1 USD".
 *
 * Rates are placeholders; keep them current from a live FX source. Each can be
 * overridden at seed time via the matching SEED_*_RATE env var.
 */
const rate = (envVar: string, fallback: number): number => Number(process.env[envVar] ?? fallback);

const CURRENCIES = [
  { code: 'USD', symbol: '$', icon: 'us', rate: 1, position: 1, sort_id: 1 },
  { code: 'EUR', symbol: '€', icon: 'eu', rate: rate('SEED_EUR_RATE', 0.92), position: 1, sort_id: 2 },
  { code: 'GBP', symbol: '£', icon: 'gb', rate: rate('SEED_GBP_RATE', 0.79), position: 1, sort_id: 3 },
  { code: 'JPY', symbol: '¥', icon: 'jp', rate: rate('SEED_JPY_RATE', 157), position: 1, sort_id: 4 },
  { code: 'CNY', symbol: '¥', icon: 'cn', rate: rate('SEED_CNY_RATE', 7.2), position: 1, sort_id: 5 },
  { code: 'NGN', symbol: '₦', icon: 'ng', rate: rate('SEED_NGN_RATE', 1600), position: 1, sort_id: 6 },
] as const;

export async function seedCurrencies(): Promise<void> {
  for (const c of CURRENCIES) {
    const existing = await prisma.currencies.findUnique({ where: { code: c.code } });
    const data = {
      code: c.code,
      symbol: c.symbol,
      icon: c.icon,
      position: c.position,
      rate: new Prisma.Decimal(c.rate),
      sort_id: BigInt(c.sort_id),
    };

    if (existing) {
      await prisma.currencies.update({ where: { id: existing.id }, data });
      console.log(`[seed] Updated currency: ${c.code} (rate=${c.rate})`);
    } else {
      await prisma.currencies.create({ data: { ...data, created_at: new Date(), updated_at: new Date() } });
      console.log(`[seed] Created currency: ${c.code} (rate=${c.rate})`);
    }
  }
}

// Allow running standalone: `tsx prisma/seeds/currencies.ts`
if (require.main === module) {
  seedCurrencies()
    .catch((err) => {
      console.error('[seed] currencies failed', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
