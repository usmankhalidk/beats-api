import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as favoritesController from './controller';
import { addFavoriteBodySchema, favoriteBeatIdParamSchema } from './validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: List the authenticated user's favorited beats
 *     description: Returns all beats the user has favorited, with full beat info plus a `favoritedAt` timestamp. Newest favorites first.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of favorited beats
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
 *                         $ref: '#/components/schemas/Favorite'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', asyncHandler(favoritesController.list));

/**
 * @openapi
 * /favorites/add:
 *   post:
 *     tags: [Favorites]
 *     summary: Add a beat to favorites
 *     description: The beat must be published (status=1). Returns 409 if the beat is already favorited.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [beatId]
 *             properties:
 *               beatId:
 *                 type: string
 *                 format: uuid
 *                 example: '01935678-1234-7890-abcd-1234567890ab'
 *     responses:
 *       201:
 *         description: Beat added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Favorite'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Beat is already in favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/add', validate({ body: addFavoriteBodySchema }), asyncHandler(favoritesController.add));

/**
 * @openapi
 * /favorites/remove/{beatId}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove a beat from favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: beatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Beat ID
 *         example: '01935678-1234-7890-abcd-1234567890ab'
 *     responses:
 *       200:
 *         description: Beat removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.delete(
  '/remove/:beatId',
  validate({ params: favoriteBeatIdParamSchema }),
  asyncHandler(favoritesController.remove),
);

export default router;
