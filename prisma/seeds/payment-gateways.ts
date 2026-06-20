import { PrismaClient } from '@prisma/client';
import { loadEnv } from '../../src/shared/config/env';

loadEnv();

const prisma = new PrismaClient();

/**
 * One row per gateway. `fees` is basis points (300 = 3.00%). Settlement currency
 * is NGN for all three gateways; credentials live in env, not the DB.
 */
const GATEWAYS = [
  { name: 'Paystack', alias: 'paystack', charge_currency: 'NGN', fees: 300 },
  { name: 'Flutterwave', alias: 'flutterwave', charge_currency: 'NGN', fees: 300 },
  { name: 'OPay', alias: 'opay', charge_currency: 'NGN', fees: 300 },
] as const;

export async function seedPaymentGateways(): Promise<void> {
  let sort = 1;
  for (const g of GATEWAYS) {
    const existing = await prisma.payment_gateways.findFirst({ where: { alias: g.alias } });
    const data = {
      name: g.name,
      alias: g.alias,
      logo: `payment-gateways/${g.alias}.svg`,
      fees: g.fees,
      charge_currency: g.charge_currency,
      is_manual: false,
      mode: 'sandbox' as const,
      status: true,
      sort_id: BigInt(sort++),
    };

    if (existing) {
      await prisma.payment_gateways.update({ where: { id: existing.id }, data });
      console.log(`[seed] Updated payment gateway: ${g.alias}`);
    } else {
      await prisma.payment_gateways.create({ data });
      console.log(`[seed] Created payment gateway: ${g.alias}`);
    }
  }
}

// Allow running standalone: `tsx prisma/seeds/payment-gateways.ts`
if (require.main === module) {
  seedPaymentGateways()
    .catch((err) => {
      console.error('[seed] payment-gateways failed', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
