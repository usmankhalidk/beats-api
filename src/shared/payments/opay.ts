import crypto from 'node:crypto';
import { config } from '@config/index';
import { Errors } from '@utils/api-error';
import { logger } from '@utils/logger';
import { toMinorUnits } from './currency';
import type { InitParams, InitResult, PaymentGateway, VerifyResult } from './types';

/**
 * OPay Cashier (Checkout) integration. OPay settles in NGN only.
 *
 * NOTE: OPay's exact request fields/paths vary by onboarded product. The shapes
 * below follow the international Cashier API; finalise field names/signing
 * against the live sandbox (Merchant ID + keys in env) when validating Phase 3.
 */

const CREATE_PATH = '/api/v1/international/cashier/create';
const STATUS_PATH = '/api/v1/international/cashier/status';

interface OpayCreateResponse {
  code: string; // '00000' on success
  message: string;
  data?: { reference: string; orderNo: string; cashierUrl: string; status: string };
}

interface OpayStatusResponse {
  code: string;
  message: string;
  data?: {
    reference: string;
    orderNo: string;
    status: string; // INITIAL | PENDING | SUCCESS | FAIL | CLOSE
    amount?: { total: number; currency: string };
  };
}

function creds(): { merchantId: string; publicKey: string; secretKey: string } {
  const { merchantId, publicKey, secretKey } = config.payments.opay;
  if (!merchantId || !publicKey || !secretKey) {
    throw Errors.badRequest({ reason: 'gateway_not_configured', gateway: 'opay' });
  }
  return { merchantId, publicKey, secretKey };
}

function sign(payload: string): string {
  return crypto.createHmac('sha512', config.payments.opay.secretKey).update(payload).digest('hex');
}

/**
 * OPay's server-to-server notification (webhook) URL. Unlike Paystack/Flutterwave
 * (configured in their dashboards), OPay takes this per-transaction in the create
 * request. Must be publicly reachable — in local dev set APP_URL to your ngrok URL.
 */
function webhookUrl(): string {
  return `${config.app.url.replace(/\/+$/, '')}/api/v1/webhooks/opay`;
}

export const opayGateway: PaymentGateway = {
  alias: 'opay',

  isConfigured(): boolean {
    const { merchantId, publicKey, secretKey } = config.payments.opay;
    return Boolean(merchantId && publicKey && secretKey);
  },

  async initializePayment(params: InitParams): Promise<InitResult> {
    const { merchantId, publicKey } = creds();
    const payload = {
      country: params.billing.country || 'NG',
      reference: params.reference,
      amount: { total: toMinorUnits(params.amountMajor), currency: 'NGN' },
      // returnUrl/cancelUrl = buyer browser redirect; callbackUrl = our webhook
      // (server-to-server). These are NOT the same endpoint.
      returnUrl: params.callbackUrl,
      cancelUrl: params.callbackUrl,
      callbackUrl: webhookUrl(),
      expireAt: 30,
      userInfo: {
        userEmail: params.customerEmail,
        userId: params.metadata.userId,
        userName: `${params.billing.firstName} ${params.billing.lastName}`.trim(),
        userMobile: '',
      },
      product: {
        name: config.app.name,
        description: `Order ${params.reference}`,
      },
      payMethod: '',
    };

    const res = await fetch(`${config.payments.opay.baseUrl}${CREATE_PATH}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicKey}`,
        MerchantId: merchantId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = (await res.json().catch(() => null)) as OpayCreateResponse | null;
    if (!res.ok || body?.code !== '00000' || !body.data?.cashierUrl) {
      logger.error('opay.init.failed', { status: res.status, code: body?.code, message: body?.message });
      throw Errors.badRequest({ reason: 'gateway_init_failed', gateway: 'opay' });
    }

    return { paymentUrl: body.data.cashierUrl, reference: body.data.reference };
  },

  async verifyPayment(reference: string): Promise<VerifyResult> {
    const { merchantId } = creds();
    const payload = { country: 'NG', reference };
    const payloadStr = JSON.stringify(payload);

    const res = await fetch(`${config.payments.opay.baseUrl}${STATUS_PATH}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sign(payloadStr)}`,
        MerchantId: merchantId,
        'Content-Type': 'application/json',
      },
      body: payloadStr,
    });

    const body = (await res.json().catch(() => null)) as OpayStatusResponse | null;
    if (!res.ok || body?.code !== '00000' || !body.data) {
      logger.error('opay.verify.failed', { status: res.status, code: body?.code, message: body?.message });
      throw Errors.badRequest({ reason: 'gateway_verify_failed', gateway: 'opay' });
    }

    const d = body.data;
    const status: VerifyResult['status'] =
      d.status === 'SUCCESS' ? 'success' : d.status === 'FAIL' || d.status === 'CLOSE' ? 'failed' : 'pending';

    return {
      status,
      amountMajor: d.amount ? d.amount.total / 100 : 0,
      currency: d.amount?.currency ?? 'NGN',
      gatewayPaymentId: d.orderNo,
      payerEmail: null,
    };
  },

  verifyWebhookSignature(rawBody: Buffer, _headers: Record<string, string>): boolean {
    try {
      const body = JSON.parse(rawBody.toString('utf8')) as { payload?: unknown; sha512?: string };
      if (!body.payload || !body.sha512) return false;
      const expected = sign(JSON.stringify(body.payload));
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(body.sha512, 'utf8');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  },

  parseWebhookReference(rawBody: Buffer): string | null {
    try {
      const body = JSON.parse(rawBody.toString('utf8')) as {
        payload?: { reference?: string };
        reference?: string;
      };
      return body.payload?.reference ?? body.reference ?? null;
    } catch {
      return null;
    }
  },
};
