import crypto from 'node:crypto';
import { config } from '@config/index';
import { Errors } from '@utils/api-error';
import { logger } from '@utils/logger';
import { toMinorUnits } from './currency';
import type { InitParams, InitResult, PaymentGateway, VerifyResult } from './types';

const BASE_URL = 'https://api.paystack.co';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string; // 'success' | 'failed' | 'abandoned' | ...
    reference: string;
    amount: number; // minor units
    currency: string;
    id: number;
    customer?: { email?: string | null };
  };
}

function secret(): string {
  const key = config.payments.paystack.secretKey;
  if (!key) throw Errors.badRequest({ reason: 'gateway_not_configured', gateway: 'paystack' });
  return key;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export const paystackGateway: PaymentGateway = {
  alias: 'paystack',

  isConfigured(): boolean {
    return Boolean(config.payments.paystack.secretKey);
  },

  async initializePayment(params: InitParams): Promise<InitResult> {
    const res = await fetch(`${BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.customerEmail,
        amount: toMinorUnits(params.amountMajor),
        currency: params.currency,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: {
          transactionId: params.metadata.transactionId,
          userId: params.metadata.userId,
        },
      }),
    });

    const body = (await res.json().catch(() => null)) as PaystackInitResponse | null;
    if (!res.ok || !body?.status || !body.data?.authorization_url) {
      logger.error('paystack.init.failed', { status: res.status, message: body?.message });
      throw Errors.badRequest({ reason: 'gateway_init_failed', gateway: 'paystack' });
    }

    return { paymentUrl: body.data.authorization_url, reference: body.data.reference };
  },

  async verifyPayment(reference: string): Promise<VerifyResult> {
    const res = await fetch(`${BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret()}` },
    });
    const body = (await res.json().catch(() => null)) as PaystackVerifyResponse | null;
    if (!res.ok || !body?.status || !body.data) {
      logger.error('paystack.verify.failed', { status: res.status, message: body?.message });
      throw Errors.badRequest({ reason: 'gateway_verify_failed', gateway: 'paystack' });
    }

    const d = body.data;
    const status: VerifyResult['status'] =
      d.status === 'success' ? 'success' : d.status === 'failed' ? 'failed' : 'pending';

    return {
      status,
      amountMajor: d.amount / 100,
      currency: d.currency,
      gatewayPaymentId: String(d.id),
      payerEmail: d.customer?.email ?? null,
    };
  },

  verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean {
    const signature = headers['x-paystack-signature'];
    if (!signature) return false;
    const expected = crypto.createHmac('sha512', secret()).update(rawBody).digest('hex');
    return timingSafeEqualHex(expected, signature);
  },

  parseWebhookReference(rawBody: Buffer): string | null {
    try {
      const payload = JSON.parse(rawBody.toString('utf8')) as { data?: { reference?: string } };
      return payload.data?.reference ?? null;
    } catch {
      return null;
    }
  },
};
