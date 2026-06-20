import { config } from '@config/index';
import { Errors } from '@utils/api-error';
import { newId } from '@utils/uuid';
import { prisma } from '@utils/prisma-client';
import {
  convertForDisplay,
  convertToNgn,
  getCurrencyRate,
  round2,
  roundCurrency,
  supportedGateways,
} from '@shared/payments/currency';
import { getGateway } from '@shared/payments/registry';
import { SETTLEMENT_CURRENCY } from '@shared/payments/types';
import type { DisplayCurrency, GatewayAlias } from '@shared/payments/types';
import { validateOrder } from '@modules/orders/service';
import { isGatewayAlias } from '@shared/payments/registry';
import * as paymentsRepo from './repository';
import { fulfillByReference } from './fulfillment';
import type { CreateCheckoutInput, PayInput } from './validation';

/** Numeric `transactions.status` → the label the Flutter app consumes. */
export type PaymentStatusLabel = 'pending' | 'paid' | 'failed' | 'cancelled';
const STATUS_LABEL: Record<number, PaymentStatusLabel> = {
  0: 'pending',
  1: 'paid',
  2: 'failed',
  3: 'cancelled',
};

type OwnedTransaction = NonNullable<Awaited<ReturnType<typeof paymentsRepo.findOwnedTransaction>>>;
type TransactionItem = OwnedTransaction['transaction_items'][number];

const LICENSE_LABEL = (lt: number): 'regular' | 'extended' => (lt === 2 ? 'extended' : 'regular');

/** Price (in the base/pricing currency) for the chosen license of an item. */
function basePriceFor(item: { regular_price: number; extended_price: number }, licenseType: number): number {
  return licenseType === 2 ? item.extended_price : item.regular_price;
}

interface PricedLine {
  item: TransactionItem;
  ngnUnit: number;
  ngnLineTotal: number;
  displayUnit: number;
  displayLineTotal: number;
}

/**
 * Server-side recompute of both the NGN (settlement) and display amounts from
 * the transaction's item snapshot. Client amounts are never trusted.
 */
function priceFromItems(
  items: TransactionItem[],
  ngnRate: number,
  displayRate: number,
  display: DisplayCurrency,
): { ngnSubtotal: number; displaySubtotal: number; lines: PricedLine[] } {
  let ngnSubtotal = 0;
  let displaySubtotal = 0;
  const lines: PricedLine[] = [];
  for (const ti of items) {
    if (!ti.items) continue;
    const base = basePriceFor(ti.items, ti.license_type);
    const ngnUnit = convertToNgn(base, ngnRate);
    const ngnLineTotal = round2(ngnUnit * ti.quantity);
    const displayUnit = convertForDisplay(base, displayRate, display);
    const displayLineTotal = roundCurrency(displayUnit * ti.quantity, display);
    ngnSubtotal = round2(ngnSubtotal + ngnLineTotal);
    displaySubtotal = roundCurrency(displaySubtotal + displayLineTotal, display);
    lines.push({ item: ti, ngnUnit, ngnLineTotal, displayUnit, displayLineTotal });
  }
  return { ngnSubtotal, displaySubtotal, lines };
}

/** STEP 1 — create a pending transaction from selected cart items. */
export async function createCheckoutSession(
  userId: string,
  input: CreateCheckoutInput,
): Promise<{ id: string }> {
  const validation = await validateOrder(userId, { cartItemIds: input.cartItemIds });
  if (!validation.ok) {
    throw Errors.conflict({ reason: 'cart_validation_failed', issues: validation.issues });
  }

  const displayCurrency = input.currency as DisplayCurrency;
  const [displayRate, ngnRate] = await Promise.all([
    getCurrencyRate(displayCurrency),
    getCurrencyRate(SETTLEMENT_CURRENCY),
  ]);

  const cartItems = await prisma.cartItem.findMany({
    where: { id: { in: input.cartItemIds }, userId },
    include: { items: { select: { regular_price: true, extended_price: true } } },
  });
  if (cartItems.length === 0) {
    throw Errors.badRequest({ reason: 'empty_cart_selection' });
  }

  let ngnSubtotal = 0;
  let displaySubtotal = 0;
  const lines = cartItems.map((ci) => {
    const base = basePriceFor(ci.items, ci.licenseType);
    const ngnUnit = convertToNgn(base, ngnRate);
    const ngnLineTotal = round2(ngnUnit * ci.quantity);
    const displayLineTotal = roundCurrency(
      convertForDisplay(base, displayRate, displayCurrency) * ci.quantity,
      displayCurrency,
    );
    ngnSubtotal = round2(ngnSubtotal + ngnLineTotal);
    displaySubtotal = roundCurrency(displaySubtotal + displayLineTotal, displayCurrency);
    return {
      itemId: ci.item_id,
      licenseType: ci.licenseType,
      unitPrice: ngnUnit, // transaction_items store NGN (drives author earnings)
      quantity: ci.quantity,
      lineTotal: ngnLineTotal,
    };
  });

  const id = await paymentsRepo.createPendingTransaction({
    userId,
    displayCurrency,
    ngnSubtotal,
    displaySubtotal,
    lines,
  });
  return { id };
}

/** STEP 2 — checkout page data, priced in the buyer's display currency. */
export async function getCheckoutPage(userId: string, id: string) {
  const tx = await loadPending(userId, id);
  const displayCurrency = (tx.display_currency as DisplayCurrency) ?? SETTLEMENT_CURRENCY;
  const [displayRate, ngnRate] = await Promise.all([
    getCurrencyRate(displayCurrency),
    getCurrencyRate(SETTLEMENT_CURRENCY),
  ]);

  const { ngnSubtotal, displaySubtotal, lines } = priceFromItems(
    tx.transaction_items,
    ngnRate,
    displayRate,
    displayCurrency,
  );

  const available = new Set<GatewayAlias>(supportedGateways());
  const activeGateways = await paymentsRepo.listActiveGateways();

  const gateways = activeGateways
    .filter((g) => available.has(g.alias as GatewayAlias))
    .filter((g) => getGateway(g.alias).isConfigured())
    .map((g) => {
      // Shown to the buyer in their currency…
      const fee = roundCurrency((displaySubtotal * g.fees) / 10000, displayCurrency);
      // …while the actual NGN charge is what the gateway will process.
      const ngnFee = round2((ngnSubtotal * g.fees) / 10000);
      return {
        alias: g.alias as GatewayAlias,
        name: g.name,
        logo: g.logo,
        feePercent: round2(g.fees / 100),
        fee,
        total: roundCurrency(displaySubtotal + fee, displayCurrency),
        chargeCurrency: SETTLEMENT_CURRENCY,
        chargeTotal: round2(ngnSubtotal + ngnFee),
      };
    });

  return {
    id: tx.id,
    currency: displayCurrency,
    settlementCurrency: SETTLEMENT_CURRENCY,
    items: lines.map(({ item: ti, displayUnit, displayLineTotal }) => ({
      id: ti.id,
      itemId: ti.item_id,
      name: ti.items?.name ?? null,
      slug: ti.items?.slug ?? null,
      thumbnail: ti.items?.thumbnail ?? null,
      licenseType: LICENSE_LABEL(ti.license_type),
      price: displayUnit,
      quantity: ti.quantity,
      total: displayLineTotal,
    })),
    subtotal: displaySubtotal,
    gateways,
  };
}

/** STEP 3 — initialise payment. Converts to NGN and charges the gateway in NGN. */
export async function payForCheckout(
  userId: string,
  id: string,
  input: PayInput,
): Promise<{ paymentUrl: string; reference: string; chargeCurrency: string; chargeAmount: number }> {
  const tx = await loadPending(userId, id);

  const displayCurrency = input.currency as DisplayCurrency;
  if (tx.display_currency && tx.display_currency !== displayCurrency) {
    throw Errors.badRequest({ reason: 'currency_mismatch', expected: tx.display_currency });
  }

  const gatewayRow = await paymentsRepo.getActiveGatewayByAlias(input.gateway);
  if (!gatewayRow) {
    throw Errors.badRequest({ reason: 'gateway_disabled', gateway: input.gateway });
  }

  const impl = getGateway(input.gateway);
  if (!impl.isConfigured()) {
    throw Errors.badRequest({ reason: 'gateway_not_configured', gateway: input.gateway });
  }

  const email = await paymentsRepo.getUserEmail(userId);
  if (!email) {
    throw Errors.badRequest({ reason: 'missing_customer_email' });
  }

  const [displayRate, ngnRate] = await Promise.all([
    getCurrencyRate(displayCurrency),
    getCurrencyRate(SETTLEMENT_CURRENCY),
  ]);

  const { ngnSubtotal, displaySubtotal } = priceFromItems(
    tx.transaction_items,
    ngnRate,
    displayRate,
    displayCurrency,
  );

  // NGN is what the gateway charges and settles.
  const ngnFee = round2((ngnSubtotal * gatewayRow.fees) / 10000);
  const ngnTotal = round2(ngnSubtotal + ngnFee);
  // Display snapshot for the buyer's receipt / order history.
  const displayFee = roundCurrency((displaySubtotal * gatewayRow.fees) / 10000, displayCurrency);
  const displayTotal = roundCurrency(displaySubtotal + displayFee, displayCurrency);

  const reference = newId();

  await paymentsRepo.updateForPay(tx.id, {
    gateway: input.gateway,
    paymentGatewayId: gatewayRow.id,
    ngnSubtotal,
    ngnFee,
    ngnTotal,
    displaySubtotal,
    displayFee,
    displayTotal,
    billing: JSON.stringify(input.billing),
    reference,
  });

  const result = await impl.initializePayment({
    reference,
    amountMajor: ngnTotal,
    currency: SETTLEMENT_CURRENCY,
    customerEmail: email,
    callbackUrl: config.payments.callbackUrl,
    billing: input.billing,
    metadata: { transactionId: tx.id, userId },
  });

  return {
    paymentUrl: result.paymentUrl,
    reference: result.reference,
    chargeCurrency: SETTLEMENT_CURRENCY,
    chargeAmount: ngnTotal,
  };
}

/**
 * Authoritative payment status for the Flutter app to poll. Reads the status the
 * webhook has already written; if it's still pending (webhook delayed or missed)
 * it performs one idempotent server-side re-verification via {@link fulfillByReference}
 * — the same verified path the webhook uses — so the app never gets stuck on
 * "pending". Redirect/callback URLs play no part in confirmation.
 */
export async function getPaymentStatus(userId: string, id: string) {
  let tx = await paymentsRepo.findOwnedForStatus(id, userId);
  if (!tx) throw Errors.notFound({ resource: 'checkout', id });

  // Self-heal: only when we have a gateway reference to verify against.
  if (tx.status === 0 && tx.gateway && isGatewayAlias(tx.gateway) && tx.gateway_reference) {
    await fulfillByReference(tx.gateway_reference);
    tx = (await paymentsRepo.findOwnedForStatus(id, userId)) ?? tx;
  }

  return {
    id: tx.id,
    reference: tx.gateway_reference,
    gateway: tx.gateway,
    status: STATUS_LABEL[tx.status] ?? 'pending',
    paid: tx.status === 1,
    currency: tx.display_currency,
    total: tx.display_total,
    settlementCurrency: tx.charge_currency,
    chargeTotal: tx.total,
    updatedAt: tx.updated_at,
  };
}

async function loadPending(userId: string, id: string): Promise<OwnedTransaction> {
  const tx = await paymentsRepo.findOwnedTransaction(id, userId);
  if (!tx) throw Errors.notFound({ resource: 'checkout', id });
  if (tx.status === 1) throw Errors.conflict({ reason: 'already_paid', id });
  if (tx.status !== 0) throw Errors.conflict({ reason: 'checkout_not_pending', id, status: tx.status });
  return tx;
}
