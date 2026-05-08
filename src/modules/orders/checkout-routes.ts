import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as ordersController from './controller';
import { checkoutBodySchema } from './validation';

/**
 * Mounted at the API root as POST /checkout (per contract — not nested under /orders).
 * Returns NOT_IMPLEMENTED until a payment provider is wired in.
 */
const router = Router();

/**
 * @openapi
 * /checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Initiate checkout for cart items
 *     description: >
 *       Converts the current cart into a transaction. Run POST /orders/validate first
 *       to check all items are purchasable.
 *       **Note:** Returns 501 until a payment provider is integrated.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^\d+$'
 *                 minItems: 1
 *                 description: Specific cart item IDs to checkout. Omit to checkout the entire cart.
 *     responses:
 *       200:
 *         description: Checkout initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: Payment provider not yet integrated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */
router.post(
  '/',
  authenticate,
  validate({ body: checkoutBodySchema }),
  asyncHandler(ordersController.checkout),
);

export default router;
