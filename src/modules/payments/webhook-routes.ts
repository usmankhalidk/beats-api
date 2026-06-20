import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { handleWebhook } from './webhook-controller';

/**
 * Webhook router (mounted at /api/v1/webhooks in app.ts, BEFORE express.json()
 * so the raw bytes survive for signature verification). No auth — gated by the
 * per-gateway signature check inside the controller. OpenAPI docs live in
 * ./routes.ts (swagger only scans routes.ts).
 */
const router = Router();

router.post('/:gateway', asyncHandler(handleWebhook));

export default router;
