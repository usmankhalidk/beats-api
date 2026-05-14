import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate as validateMw } from '@middleware/validate';
import * as ordersController from './controller';
import { listOrdersQuerySchema, orderIdParamSchema, validateOrderBodySchema } from './validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List purchase history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, cancelled]
 *         description: Filter by transaction status
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Paginated order list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', validateMw({ query: listOrdersQuerySchema }), asyncHandler(ordersController.list));

/**
 * @openapi
 * /orders/validate:
 *   post:
 *     tags: [Orders]
 *     summary: Validate cart items before checkout
 *     description: Checks that all cart items are still published, purchasable, and not already owned. Run this before POST /checkout.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cartItemIds]
 *             properties:
 *               cartItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^\d+$'
 *                 minItems: 1
 *                 example: ['1', '2', '3']
 *     responses:
 *       200:
 *         description: Validation result
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
 *                         ok:
 *                           type: boolean
 *                           description: true if all items passed validation
 *                         issues:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               cartItemId:
 *                                 type: string
 *                               reason:
 *                                 type: string
 *                                 enum: [not_found, beat_not_published, beat_not_purchasable, already_purchased]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/validate',
  validateMw({ body: validateOrderBodySchema }),
  asyncHandler(ordersController.validate),
);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a single order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: '01935678-1234-7890-abcd-1234567890ab'
 *     responses:
 *       200:
 *         description: Order detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validateMw({ params: orderIdParamSchema }), asyncHandler(ordersController.get));

export default router;
