import { prisma } from '@utils/prisma-client';
import { SETTLEMENT_CURRENCY } from '@shared/payments/types';
import type { DisplayCurrency, GatewayAlias } from '@shared/payments/types';

/** Item + license picked from the cart, priced in NGN (the settlement currency). */
export interface PendingLine {
  itemId: string;
  licenseType: number; // 1 = regular, 2 = extended
  unitPrice: number; // NGN
  quantity: number;
  lineTotal: number; // NGN
}

const transactionWithItems = {
  transaction_items: {
    include: {
      items: {
        select: {
          id: true,
          author_id: true,
          name: true,
          slug: true,
          thumbnail: true,
          regular_price: true,
          extended_price: true,
        },
      },
    },
  },
} as const;

export async function createPendingTransaction(args: {
  userId: string;
  displayCurrency: DisplayCurrency;
  /** Subtotal in NGN (settlement) — what amount/total are stored as. */
  ngnSubtotal: number;
  /** Subtotal in the buyer's display currency — for receipts/order history. */
  displaySubtotal: number;
  lines: PendingLine[];
}): Promise<string> {
  const now = new Date();
  const tx = await prisma.transactions.create({
    data: {
      user_id: args.userId,
      type: 'purchase',
      status: 0,
      amount: args.ngnSubtotal,
      fees: 0,
      total: args.ngnSubtotal,
      charge_currency: SETTLEMENT_CURRENCY,
      display_currency: args.displayCurrency,
      display_amount: args.displaySubtotal,
      display_fees: 0,
      display_total: args.displaySubtotal,
      created_at: now,
      updated_at: now,
      transaction_items: {
        create: args.lines.map((l) => ({
          item_id: l.itemId,
          license_type: l.licenseType,
          price: l.unitPrice,
          quantity: l.quantity,
          total: l.lineTotal,
          created_at: now,
          updated_at: now,
        })),
      },
    },
    select: { id: true },
  });
  return tx.id;
}

export async function findOwnedTransaction(id: string, userId: string) {
  return prisma.transactions.findFirst({
    where: { id, user_id: userId, type: 'purchase' },
    include: transactionWithItems,
  });
}

/**
 * Lean read for the status-poll endpoint — only the fields the Flutter app needs
 * to render payment state, plus `gateway_reference` for the re-verify fallback.
 */
export async function findOwnedForStatus(id: string, userId: string) {
  return prisma.transactions.findFirst({
    where: { id, user_id: userId, type: 'purchase' },
    select: {
      id: true,
      status: true,
      gateway: true,
      gateway_reference: true,
      charge_currency: true,
      total: true,
      display_currency: true,
      display_total: true,
      updated_at: true,
    },
  });
}

export async function findByGatewayReference(reference: string) {
  return prisma.transactions.findFirst({
    where: { gateway_reference: reference },
    include: {
      ...transactionWithItems,
      users: { select: { email: true } },
    },
  });
}

export async function updateForPay(
  id: string,
  data: {
    gateway: GatewayAlias;
    paymentGatewayId: string;
    /** NGN settlement amounts — what the gateway is actually charged. */
    ngnSubtotal: number;
    ngnFee: number;
    ngnTotal: number;
    /** Display-currency snapshot for the buyer's receipt. */
    displaySubtotal: number;
    displayFee: number;
    displayTotal: number;
    billing: string;
    reference: string;
  },
): Promise<void> {
  await prisma.transactions.update({
    where: { id },
    data: {
      gateway: data.gateway,
      payment_gateway_id: data.paymentGatewayId,
      charge_currency: SETTLEMENT_CURRENCY,
      amount: data.ngnSubtotal,
      fees: data.ngnFee,
      total: data.ngnTotal,
      display_amount: data.displaySubtotal,
      display_fees: data.displayFee,
      display_total: data.displayTotal,
      billing: data.billing,
      gateway_reference: data.reference,
      updated_at: new Date(),
    },
  });
}

export async function listActiveGateways() {
  return prisma.payment_gateways.findMany({
    where: { status: true },
    orderBy: { sort_id: 'asc' },
    select: { id: true, name: true, alias: true, fees: true, logo: true },
  });
}

export async function getActiveGatewayByAlias(alias: GatewayAlias) {
  return prisma.payment_gateways.findFirst({
    where: { alias, status: true },
    select: { id: true, name: true, alias: true, fees: true },
  });
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email ?? null;
}
