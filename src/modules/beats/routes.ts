import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { asyncHandler } from '@utils/async-handler';
import { authenticate, optionalAuthenticate } from '@middleware/auth';
import { requireRoles } from '@middleware/role';
import { validate } from '@middleware/validate';
import { Errors } from '@utils/api-error';
import { ROLES } from '@constants/roles';
import * as beatsController from './controller';
import {
  createBeatBodySchema,
  featuredBeatsQuerySchema,
  filterBeatsQuerySchema,
  freeBeatsQuerySchema,
  idParamSchema,
  listBeatsQuerySchema,
  replaceBeatBodySchema,
  searchBeatsQuerySchema,
} from './validation';

const router = Router();

const beatUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-wav'];
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.fieldname === 'beatFile' && audioTypes.includes(file.mimetype)) return cb(null, true);
    if (file.fieldname === 'coverImage' && imageTypes.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type for field: ${file.fieldname}`));
  },
}).fields([
  { name: 'beatFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

function handleBeatUpload(req: Request, res: Response, next: NextFunction): void {
  beatUpload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(err.code === 'LIMIT_FILE_SIZE' ? Errors.badRequest({ reason: 'file_too_large', maxSize: '100MB' }) : Errors.badRequest({ reason: err.code }));
      return;
    }
    if (err instanceof Error) { next(Errors.badRequest({ reason: err.message })); return; }
    next();
  });
}

/**
 * IMPORTANT: literal sub-routes (/search, /filter, /featured, /free) must be
 * declared BEFORE /:id, otherwise Express matches them as ids.
 */

/**
 * @openapi
 * /beats/search:
 *   get:
 *     tags: [Beats]
 *     summary: Search beats by keyword, BPM, or tag
 *     description: At least one of `q`, `bpm`, or `tag` is required.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Search in title, description, and tags
 *       - in: query
 *         name: bpm
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 400
 *         description: Exact BPM match
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Tag contains search
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
 *         description: Search results
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
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  '/search',
  optionalAuthenticate,
  validate({ query: searchBeatsQuerySchema }),
  asyncHandler(beatsController.search),
);

/**
 * @openapi
 * /beats/filter:
 *   get:
 *     tags: [Beats]
 *     summary: Filter beats by category, price, or free flag
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug
 *       - in: query
 *         name: subCategory
 *         schema:
 *           type: string
 *         description: Sub-category slug
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum regular price
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum regular price
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
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
 *         description: Filtered beats
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
 */
router.get(
  '/filter',
  optionalAuthenticate,
  validate({ query: filterBeatsQuerySchema }),
  asyncHandler(beatsController.filter),
);

/**
 * @openapi
 * /beats/featured:
 *   get:
 *     tags: [Beats]
 *     summary: List featured beats
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Featured beats
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
 */
router.get(
  '/featured',
  optionalAuthenticate,
  validate({ query: featuredBeatsQuerySchema }),
  asyncHandler(beatsController.featured),
);

/**
 * @openapi
 * /beats/free:
 *   get:
 *     tags: [Beats]
 *     summary: List free beats
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Free beats
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
 */
router.get(
  '/free',
  optionalAuthenticate,
  validate({ query: freeBeatsQuerySchema }),
  asyncHandler(beatsController.free),
);

/**
 * @openapi
 * /beats:
 *   get:
 *     tags: [Beats]
 *     summary: List all published beats
 *     parameters:
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
 *         description: Paginated list of beats
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
 */
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: listBeatsQuerySchema }),
  asyncHandler(beatsController.list),
);

/**
 * @openapi
 * /beats/{id}:
 *   get:
 *     tags: [Beats]
 *     summary: Get a single beat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Beat detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Beat'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validate({ params: idParamSchema }),
  asyncHandler(beatsController.get),
);

/**
 * @openapi
 * /beats:
 *   post:
 *     tags: [Beats]
 *     summary: Upload a new beat
 *     description: Requires PRODUCER or ADMIN role. Send as multipart/form-data.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/BeatWrite'
 *     responses:
 *       201:
 *         description: Beat created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Beat'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  handleBeatUpload,
  validate({ body: createBeatBodySchema }),
  asyncHandler(beatsController.create),
);

/**
 * @openapi
 * /beats/{id}:
 *   put:
 *     tags: [Beats]
 *     summary: Update a beat by ID
 *     description: Requires PRODUCER or ADMIN role. Send as multipart/form-data. beatFile and coverImage are optional — omit to keep existing files.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/BeatWrite'
 *     responses:
 *       200:
 *         description: Beat updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Beat'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put(
  '/:id',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  handleBeatUpload,
  validate({ params: idParamSchema, body: replaceBeatBodySchema }),
  asyncHandler(beatsController.replace),
);

/**
 * @openapi
 * /beats/{id}:
 *   delete:
 *     tags: [Beats]
 *     summary: Delete a beat by ID
 *     description: Requires PRODUCER or ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Beat deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(beatsController.remove),
);

export default router;
