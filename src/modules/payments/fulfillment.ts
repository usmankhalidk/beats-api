import crypto from 'node:crypto';
import { prisma } from '@utils/prisma-client';
import { logger } from '@utils/logger';
import { round2 } from '@shared/payments/currency';
import { getGateway, isGatewayAlias } from '@shared/payments/registry';

export type FulfillmentOutcome =
  | 'fulfilled'
  | 'already_fulfilled'
  | 'unknown_reference'
  | 'pending'
  | 'failed'
  | 'amount_mismatch'
  | 'unverifiable';

/** Tolerance (major units) when matching the verified amount to our total. */
const AMOUNT_TOLERANCE = 0.5;

function generatePurchaseCode(): string {
  return `BP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

function billingCountry(billing: string | null): string | null {
  if (!billing) return null;
  try {
    const parsed = JSON.parse(billing) as { country?: string };
    return parsed.country ?? null;
  } catch {
    return null;
  }
}

/**
 * Authoritative, idempotent fulfillment. Safe to call from the webhook AND the
 * callback — the `status = 0` guard makes duplicate calls no-ops.
 */
export async function fulfillByReference(reference: string): Promise<FulfillmentOutcome> {
  const tx = await prisma.transactions.findFirst({
    where: { gateway_reference: reference },
    include: {
      transaction_items: {
        include: { items: { select: { id: true, author_id: true } } },
      },
      users: { select: { email: true } },
    },
  });

  if (!tx) {
    logger.warn('fulfillment.unknown_reference', { reference });
    return 'unknown_reference';
  }
  if (tx.status === 1) return 'already_fulfilled';
  if (!tx.gateway || !isGatewayAlias(tx.gateway)) {
    logger.error('fulfillment.no_gateway', { reference, id: tx.id });
    return 'unverifiable';
  }

  // Always re-verify with the gateway — never trust the webhook body alone.
  const verified = await getGateway(tx.gateway).verifyPayment(reference);

  if (verified.status === 'pending') return 'pending';
  if (verified.status === 'failed') {
    await prisma.transactions.updateMany({ where: { id: tx.id, status: 0 }, data: { status: 2, updated_at: new Date() } });
    return 'failed';
  }

  // success — assert amount + currency match what we asked for.
  const amountOk = Math.abs(verified.amountMajor - tx.total) <= AMOUNT_TOLERANCE;
  const currencyOk = !tx.charge_currency || verified.currency.toUpperCase() === tx.charge_currency.toUpperCase();
  if (!amountOk || !currencyOk) {
    logger.error('fulfillment.amount_mismatch', {
      reference,
      id: tx.id,
      expected: tx.total,
      expectedCurrency: tx.charge_currency,
      got: verified.amountMajor,
      gotCurrency: verified.currency,
    });
    await prisma.transactions.updateMany({ where: { id: tx.id, status: 0 }, data: { status: 2, updated_at: new Date() } });
    return 'amount_mismatch';
  }

  const subtotal = tx.amount;
  const totalFee = tx.fees ?? 0;
  const country = billingCountry(tx.billing);
  const payerEmail = verified.payerEmail ?? tx.users?.email ?? null;
  const now = new Date();

  const outcome = await prisma.$transaction(async (txc) => {
    // Idempotency guard: flip 0 → 1 atomically; if another worker won, bail.
    const claimed = await txc.transactions.updateMany({
      where: { id: tx.id, status: 0 },
      data: { status: 1, payment_id: verified.gatewayPaymentId, payer_email: payerEmail, updated_at: now },
    });
    if (claimed.count === 0) return 'already_fulfilled' as const;

    const purchasedItemIds: string[] = [];

    for (const ti of tx.transaction_items) {
      if (!ti.items) continue;
      const isExtended = ti.license_type === 2;
      const unitPrice = ti.price;
      const buyerFeeShare = subtotal > 0 ? round2(totalFee * (ti.total / subtotal)) : 0;
      const authorEarning = unitPrice; // platform commission defaults to 0 (Model A)

      const sale = await txc.sales.create({
        data: {
          author_id: ti.items.author_id,
          user_id: tx.user_id,
          item_id: ti.items.id,
          license_type: isExtended,
          price: unitPrice,
          buyer_fee: buyerFeeShare,
          author_fee: 0,
          author_earning: authorEarning,
          country,
          status: true,
          created_at: now,
          updated_at: now,
        },
        select: { id: true },
      });

      await txc.purchases.create({
        data: {
          user_id: tx.user_id,
          author_id: ti.items.author_id,
          sale_id: sale.id,
          item_id: ti.items.id,
          license_type: isExtended,
          code: generatePurchaseCode(),
          is_downloaded: false,
          status: true,
          created_at: now,
          updated_at: now,
        },
      });

      await txc.user.update({
        where: { id: ti.items.author_id },
        data: { balance: { increment: authorEarning } },
      });

      purchasedItemIds.push(ti.items.id);
    }

    // Clear the purchased beats from the buyer's cart.
    if (purchasedItemIds.length > 0) {
      await txc.cartItem.deleteMany({
        where: { userId: tx.user_id, item_id: { in: purchasedItemIds } },
      });
    }

    return 'fulfilled' as const;
  });

  if (outcome === 'fulfilled') {
    logger.info('fulfillment.completed', { reference, id: tx.id, gateway: tx.gateway });
  }
  return outcome;
}
