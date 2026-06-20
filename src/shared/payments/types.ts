/**
 * Gateway-agnostic contracts. Every concrete gateway (Paystack, Flutterwave,
 * OPay) implements {@link PaymentGateway}; the rest of the app only ever talks
 * to this interface, never to a gateway SDK directly.
 */

export type GatewayAlias = 'paystack' | 'flutterwave' | 'opay';

/**
 * Currencies the buyer may browse/checkout in (display only). Prices are stored
 * in the base currency (USD) and converted to the chosen display currency for
 * presentation. The actual charge always happens in {@link SettlementCurrency}.
 */
export type DisplayCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'NGN';

/** The only currency we ever charge/settle in. Every gateway is charged in NGN. */
export type SettlementCurrency = 'NGN';
export const SETTLEMENT_CURRENCY: SettlementCurrency = 'NGN';

export interface BillingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface InitParams {
  /** Our `transactions.gateway_reference` — the idempotency key for fulfillment. */
  reference: string;
  /** Grand total (subtotal + gateway fee) in major units of {@link currency}. */
  amountMajor: number;
  /** Always NGN — the gateway is charged in the settlement currency. */
  currency: SettlementCurrency;
  customerEmail: string;
  /** Absolute URL the gateway redirects the buyer back to after payment. */
  callbackUrl: string;
  billing: BillingAddress;
  metadata: { transactionId: string; userId: string };
}

export interface InitResult {
  /** Hosted payment page the buyer is sent to. */
  paymentUrl: string;
  /** Echoed reference (may be gateway-normalised). */
  reference: string;
}

export interface VerifyResult {
  status: 'success' | 'failed' | 'pending';
  amountMajor: number;
  currency: string;
  /** Gateway-side payment id → persisted as `transactions.payment_id`. */
  gatewayPaymentId: string;
  payerEmail: string | null;
}

export interface PaymentGateway {
  readonly alias: GatewayAlias;
  /** True when the required secrets for this gateway are configured in env. */
  isConfigured(): boolean;
  initializePayment(params: InitParams): Promise<InitResult>;
  verifyPayment(reference: string): Promise<VerifyResult>;
  /** HMAC / shared-secret check over the raw request body. */
  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean;
  /** Extracts our `gateway_reference` from a webhook payload, or null if absent. */
  parseWebhookReference(rawBody: Buffer): string | null;
}
