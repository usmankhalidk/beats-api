import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { optionalAuthenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as categoriesController from './controller';
import {
  categoryBeatsQuerySchema,
  listCategoriesQuerySchema,
  slugParamSchema,
} from './validation';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     description: Returns all genres/categories ordered by name.
 *     responses:
 *       200:
 *         description: List of categories
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
 *                         $ref: '#/components/schemas/Category'
 */
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: listCategoriesQuerySchema }),
  asyncHandler(categoriesController.list),
);

/**
 * @openapi
 * /categories/{slug}/beats:
 *   get:
 *     tags: [Categories]
 *     summary: List beats for a category
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
 *         example: hip-hop
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, priceAsc, priceDesc, bpmAsc, bpmDesc]
 *           default: newest
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Paginated beats for the category
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
 *                         $ref: '#/components/schemas/Beat'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:slug/beats',
  optionalAuthenticate,
  validate({ params: slugParamSchema, query: categoryBeatsQuerySchema }),
  asyncHandler(categoriesController.listBeats),
);

export default router;
