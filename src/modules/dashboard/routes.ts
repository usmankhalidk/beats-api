import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { requireRoles } from '@middleware/role';
import { validate } from '@middleware/validate';
import { ROLES } from '@constants/roles';
import * as dashboardController from './controller';
import { earningsQuerySchema, salesQuerySchema } from './validation';

const router = Router();

router.use(authenticate);
router.use(requireRoles(ROLES.PRODUCER, ROLES.ADMIN));

/**
 * @openapi
 * /dashboard/earnings:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get producer earnings history
 *     description: Returns individual sale records with author_earning per sale and a running total. Requires PRODUCER or ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sales on or after this date (ISO 8601)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sales on or before this date (ISO 8601)
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Earnings list with total
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
 *                         $ref: '#/components/schemas/EarningRecord'
 *                     meta:
 *                       allOf:
 *                         - $ref: '#/components/schemas/PaginationMeta'
 *                         - type: object
 *                           properties:
 *                             totalAmount:
 *                               type: string
 *                               example: '1250.50'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/earnings', validate({ query: earningsQuerySchema }), asyncHandler(dashboardController.earnings));

/**
 * @openapi
 * /dashboard/sales:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get producer sales history
 *     description: Returns a list of individual sales made for the authenticated producer's beats. Requires PRODUCER or ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sales on or after this date (ISO 8601)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sales on or before this date (ISO 8601)
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Paginated sales list
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
 *                         $ref: '#/components/schemas/EarningRecord'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/sales', validate({ query: salesQuerySchema }), asyncHandler(dashboardController.sales));

export default router;
