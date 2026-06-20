import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as paymentsController from './controller';
import { createCheckoutBodySchema, checkoutIdParamSchema, payBodySchema } from './validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /checkout:
 *   post:
 *     tags: [Payments]
 *     summary: Create a checkout session
 *     description: >
 *       Validates the selected cart items, prices them in the chosen currency,
 *       and creates a pending transaction. Returns the transaction id used by the
 *       remaining checkout steps.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cartItemIds, currency]
 *             properties:
 *               cartItemIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 minItems: 1
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, JPY, CNY, NGN]
 *                 description: Display currency for the checkout. Payment always settles in NGN.
 *     responses:
 *       201:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id: { type: string, format: uuid }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       409: { $ref: '#/components/responses/BadRequest' }
 *       422: { $ref: '#/components/responses/ValidationError' }
 */
router.post(
  '/',
  validate({ body: createCheckoutBodySchema }),
  asyncHandler(paymentsController.createSession),
);

/**
 * @openapi
 * /checkout/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get checkout page data
 *     description: Items, subtotal, and the available gateways with per-gateway fee and total.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Checkout page
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CheckoutPage' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get(
  '/:id',
  validate({ params: checkoutIdParamSchema }),
  asyncHandler(paymentsController.getPage),
);

/**
 * @openapi
 * /checkout/{id}/pay:
 *   post:
 *     tags: [Payments]
 *     summary: Initialize payment with a gateway
 *     description: >
 *       Recomputes amount/fee/total server-side, persists the gateway choice and
 *       billing snapshot, then initialises the gateway and returns the hosted
 *       payment URL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PayRequest' }
 *     responses:
 *       200:
 *         description: Payment initialised
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         paymentUrl: { type: string, format: uri }
 *                         reference: { type: string }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/ValidationError' }
 */
router.post(
  '/:id/pay',
  validate({ params: checkoutIdParamSchema, body: payBodySchema }),
  asyncHandler(paymentsController.pay),
);

/**
 * @openapi
 * /checkout/{id}/status:
 *   get:
 *     tags: [Payments]
 *     summary: Poll the verified payment status
 *     description: >
 *       Authoritative payment status for the client (e.g. the Flutter app) to poll
 *       after sending the buyer to the gateway. Payment confirmation is handled
 *       server-side via gateway webhooks; this endpoint reports the verified result
 *       our backend already holds. If the status is still pending (webhook delayed
 *       or missed) it performs one idempotent server-side re-verification before
 *       responding, so the client never gets stuck. Gateway redirect/callback URLs
 *       play no part in confirmation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The checkout/transaction id returned by POST /checkout.
 *     responses:
 *       200:
 *         description: Current payment status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id: { type: string, format: uuid }
 *                         reference: { type: string, nullable: true }
 *                         gateway: { type: string, nullable: true, enum: [paystack, flutterwave, opay] }
 *                         status: { type: string, enum: [pending, paid, failed, cancelled] }
 *                         paid: { type: boolean }
 *                         currency: { type: string, nullable: true, description: Display currency }
 *                         total: { type: number, nullable: true, description: Total in display currency }
 *                         settlementCurrency: { type: string, nullable: true, description: Always NGN }
 *                         chargeTotal: { type: number, nullable: true, description: Amount charged in NGN }
 *                         updatedAt: { type: string, format: date-time, nullable: true }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /webhooks/{gateway}:
 *   post:
 *     tags: [Payments]
 *     summary: Gateway webhook (signature-gated) — the sole payment confirmation path
 *     description: >
 *       Public, no bearer token. The request body is verified against the gateway
 *       signature, then the payment is re-verified with the gateway and fulfilled
 *       idempotently. This is the only mechanism that confirms payments — the buyer
 *       redirect is not relied upon. Register this URL in each gateway dashboard.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: gateway
 *         required: true
 *         schema: { type: string, enum: [paystack, flutterwave, opay] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, description: 'Raw gateway event payload' }
 *     responses:
 *       200: { description: Accepted or ignored }
 *       401: { description: Invalid signature }
 *       500: { description: Processing error — gateway should retry }
 */
router.get(
  '/:id/status',
  validate({ params: checkoutIdParamSchema }),
  asyncHandler(paymentsController.getStatus),
);

export default router;
