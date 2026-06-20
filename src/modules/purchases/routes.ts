import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as purchasesController from './controller';
import { listPurchasesQuerySchema, purchaseIdParamSchema } from './validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /purchases:
 *   get:
 *     tags: [Purchases]
 *     summary: List the authenticated buyer's purchases
 *     description: >
 *       Returns all completed purchases for the authenticated user, newest first.
 *       Use `data[].id` (purchase ID) to call `GET /downloads/{id}` for a signed download URL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Paginated list of purchases
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
 *                         $ref: '#/components/schemas/Purchase'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', validate({ query: listPurchasesQuerySchema }), asyncHandler(purchasesController.list));

/**
 * @openapi
 * /purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: Get a single purchase by ID
 *     description: >
 *       Returns a single purchase record belonging to the authenticated user.
 *       Use the returned `id` with `GET /downloads/{id}` to get a signed download URL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase ID
 *         example: '01935678-1234-7890-abcd-1234567890ab'
 *     responses:
 *       200:
 *         description: Purchase detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Purchase'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/:id', validate({ params: purchaseIdParamSchema }), asyncHandler(purchasesController.get));

export default router;
