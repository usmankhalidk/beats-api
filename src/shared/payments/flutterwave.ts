import crypto from 'node:crypto';
import { config } from '@config/index';
import { Errors } from '@utils/api-error';
import { logger } from '@utils/logger';
import type { InitParams, InitResult, PaymentGateway, VerifyResult } from './types';

const BASE_URL = 'https://api.flutterwave.com/v3';

const BASE_PAYMENT_OPTIONS = ['card', 'banktransfer', 'ussd'];

interface FlwInitResponse {
  status: string; // 'success'
  message: string;
  data?: { link: string };
}

interface FlwVerifyResponse {
  status: string;
  message: string;
  data?: {
    status: string; // 'successful' | 'failed' | 'pending'
    tx_ref: string;
    amount: number; // major units
    currency: string;
    id: number;
    customer?: { email?: string | null };
  };
}

function secret(): string {
  const key = config.payments.flutterwave.secretKey;
  if (!key) throw Errors.badRequest({ reason: 'gateway_not_configured', gateway: 'flutterwave' });
  return key;
}

function paymentOptions(): string {
  const opts = [...BASE_PAYMENT_OPTIONS];
  if (config.payments.flutterwave.googlePayEnabled) opts.push('googlepay');
  return opts.join(',');
}

export const flutterwaveGateway: PaymentGateway = {
  alias: 'flutterwave',

  isConfigured(): boolean {
    return Boolean(config.payments.flutterwave.secretKey);
  },

  async initializePayment(params: InitParams): Promise<InitResult> {
    const customerName = `${params.billing.firstName} ${params.billing.lastName}`.trim();
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: params.reference,
        amount: params.amountMajor,
        currency: params.currency,
        redirect_url: params.callbackUrl,
        payment_options: paymentOptions(),
        customer: {
          email: params.customerEmail,
          name: customerName || undefined,
        },
        meta: {
          transactionId: params.metadata.transactionId,
          userId: params.metadata.userId,
        },
        customizations: { title: config.app.name },
      }),
    });

    const body = (await res.json().catch(() => null)) as FlwInitResponse | null;
    if (!res.ok || body?.status !== 'success' || !body.data?.link) {
      logger.error('flutterwave.init.failed', { status: res.status, message: body?.message });
      throw Errors.badRequest({ reason: 'gateway_init_failed', gateway: 'flutterwave' });
    }

    return { paymentUrl: body.data.link, reference: params.reference };
  },

  async verifyPayment(reference: string): Promise<VerifyResult> {
    const url = `${BASE_URL}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret()}` } });
    const body = (await res.json().catch(() => null)) as FlwVerifyResponse | null;
    if (!res.ok || body?.status !== 'success' || !body.data) {
      logger.error('flutterwave.verify.failed', { status: res.status, message: body?.message });
      throw Errors.badRequest({ reason: 'gateway_verify_failed', gateway: 'flutterwave' });
    }

    const d = body.data;
    const status: VerifyResult['status'] =
      d.status === 'successful' ? 'success' : d.status === 'failed' ? 'failed' : 'pending';

    return {
      status,
      amountMajor: d.amount,
      currency: d.currency,
      gatewayPaymentId: String(d.id),
      payerEmail: d.customer?.email ?? null,
    };
  },

  verifyWebhookSignature(_rawBody: Buffer, headers: Record<string, string>): boolean {
    const expected = config.payments.flutterwave.webhookHash;
    const received = headers['verif-hash'];
    if (!expected || !received) return false;
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(received, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  },

  parseWebhookReference(rawBody: Buffer): string | null {
    try {
      // Flutterwave sends two webhook shapes depending on account settings:
      //   v3:     { event, data: { tx_ref } }
      //   legacy: { txRef, flwRef, "event.type" }  (top-level, camelCase)
      const payload = JSON.parse(rawBody.toString('utf8')) as {
        data?: { tx_ref?: string };
        txRef?: string;
      };
      return payload.data?.tx_ref ?? payload.txRef ?? null;
    } catch {
      return null;
    }
  },
};
