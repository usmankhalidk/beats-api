import type { Request, Response } from 'express';
import { logger } from '@utils/logger';
import { getGateway, isGatewayAlias } from '@shared/payments/registry';
import { fulfillByReference } from './fulfillment';

function flattenHeaders(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') out[key] = value;
    else if (Array.isArray(value) && value.length > 0) out[key] = value[0]!;
  }
  return out;
}

/**
 * Public, signature-gated webhook receiver. Mounted with `express.raw` so
 * `req.body` is the exact bytes the gateway signed.
 *
 * Responses: 200 = accepted/ignored, 401 = bad signature, 500 = retry me.
 */
export async function handleWebhook(req: Request, res: Response): Promise<Response> {
  const alias = String(req.params['gateway']);
  if (!isGatewayAlias(alias)) {
    return res.status(404).json({ success: false, code: 404, message: 'UNKNOWN_GATEWAY' });
  }

  const rawBody: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  const gateway = getGateway(alias);

  if (!gateway.verifyWebhookSignature(rawBody, flattenHeaders(req))) {
    logger.warn('webhook.bad_signature', { gateway: alias });
    return res.status(401).json({ success: false, code: 401, message: 'INVALID_SIGNATURE' });
  }

  const reference = gateway.parseWebhookReference(rawBody);
  if (!reference) {
    // Valid signature but nothing actionable (e.g. a non-charge event) — ack it.
    return res.status(200).json({ success: true, code: 200, message: 'IGNORED' });
  }

  try {
    const outcome = await fulfillByReference(reference);
    return res.status(200).json({ success: true, code: 200, message: 'OK', data: { outcome } });
  } catch (err) {
    // Surface a 500 so the gateway retries the delivery.
    logger.error('webhook.processing_failed', {
      gateway: alias,
      reference,
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ success: false, code: 500, message: 'PROCESSING_ERROR' });
  }
}
