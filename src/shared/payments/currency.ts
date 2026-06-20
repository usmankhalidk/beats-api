import { prisma } from '@utils/prisma-client';
import { Errors } from '@utils/api-error';
import type { DisplayCurrency, GatewayAlias } from './types';

/**
 * Currencies the buyer may check out in. These are DISPLAY currencies only —
 * prices are stored in the base currency (the `currencies` row with rate = 1,
 * i.e. USD) and converted for presentation. The charge always settles in NGN.
 */
export const SUPPORTED_CURRENCIES: readonly DisplayCurrency[] = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'NGN',
];

/** Currencies with no minor unit (whole-number only) — affects display rounding. */
const ZERO_DECIMAL_CURRENCIES = new Set<DisplayCurrency>(['JPY']);

export function isSupportedCurrency(code: string): code is DisplayCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}

/** Decimal places used when displaying an amount in {@link code}. */
export function currencyDecimals(code: DisplayCurrency): number {
  return ZERO_DECIMAL_CURRENCIES.has(code) ? 0 : 2;
}

/** Round half-up to 2 decimal places, avoiding binary float drift. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round a display amount to the right number of decimals for its currency. */
export function roundCurrency(value: number, code: DisplayCurrency): number {
  const factor = 10 ** currencyDecimals(code);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** NGN is a 2-decimal currency → minor units (kobo) are ×100. */
export function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

/**
 * Conversion rate from the base pricing currency (the `currencies` row with
 * rate = 1) to {@link code}. Item prices are stored in the base currency.
 */
export async function getCurrencyRate(code: DisplayCurrency): Promise<number> {
  const row = await prisma.currencies.findUnique({ where: { code } });
  if (!row) {
    throw Errors.badRequest({ reason: 'currency_not_configured', currency: code });
  }
  const rate = Number(row.rate);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw Errors.badRequest({ reason: 'currency_rate_invalid', currency: code });
  }
  return rate;
}

/** Convert a base-currency amount into NGN (the settlement currency). */
export function convertToNgn(baseAmount: number, ngnRate: number): number {
  return round2(baseAmount * ngnRate);
}

/** Convert a base-currency amount into a display currency, rounded for display. */
export function convertForDisplay(baseAmount: number, rate: number, code: DisplayCurrency): number {
  return roundCurrency(baseAmount * rate, code);
}

/**
 * Gateways usable for a checkout. Because every charge settles in NGN, all
 * configured gateways are available for every display currency. Final
 * availability is still gated by DB `status` and {@link PaymentGateway.isConfigured}.
 */
export function supportedGateways(): GatewayAlias[] {
  return ['paystack', 'flutterwave', 'opay'];
}
