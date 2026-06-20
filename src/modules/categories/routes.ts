import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate, optionalAuthenticate } from '@middleware/auth';
import { requireRoles } from '@middleware/role';
import { validate } from '@middleware/validate';
import { ROLES } from '@constants/roles';
import * as categoriesController from './controller';
import {
  categoryBeatsQuerySchema,
  categoryIdParamSchema,
  createCategoryBodySchema,
  listCategoriesQuerySchema,
  slugParamSchema,
  updateCategoryBodySchema,
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

/**
 * @openapi
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     description: Requires ADMIN role. If slug is omitted it is generated from the name.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryWrite'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CategoryDetail'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409:
 *         description: Slug already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422: { $ref: '#/components/responses/ValidationError' }
 */
router.post(
  '/',
  authenticate,
  requireRoles(ROLES.ADMIN),
  validate({ body: createCategoryBodySchema }),
  asyncHandler(categoriesController.create),
);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a single category by ID (full detail)
 *     description: Requires ADMIN role. Returns all manageable fields including fees and media dimensions.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CategoryDetail'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get(
  '/:id',
  authenticate,
  requireRoles(ROLES.ADMIN),
  validate({ params: categoryIdParamSchema }),
  asyncHandler(categoriesController.get),
);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     description: Requires ADMIN role. Send only the fields to change (at least one).
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
 *           schema:
 *             $ref: '#/components/schemas/CategoryWrite'
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CategoryDetail'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: Slug already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422: { $ref: '#/components/responses/ValidationError' }
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     description: >
 *       Requires ADMIN role. Refuses (409) when the category still has beats or
 *       sub-categories, since deletion would cascade to them.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: Category still in use (has beats or sub-categories)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */
router.put(
  '/:id',
  authenticate,
  requireRoles(ROLES.ADMIN),
  validate({ params: categoryIdParamSchema, body: updateCategoryBodySchema }),
  asyncHandler(categoriesController.update),
);

router.delete(
  '/:id',
  authenticate,
  requireRoles(ROLES.ADMIN),
  validate({ params: categoryIdParamSchema }),
  asyncHandler(categoriesController.remove),
);

export default router;
