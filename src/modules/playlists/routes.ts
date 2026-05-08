import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as playlistsController from './controller';
import {
  addBeatToPlaylistBodySchema,
  createPlaylistBodySchema,
  playlistBeatParamSchema,
  playlistIdParamSchema,
} from './validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /playlists:
 *   get:
 *     tags: [Playlists]
 *     summary: List the authenticated user's playlists
 *     description: Returns all playlists owned by the current user, each with its full item list ordered by position.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of playlists
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
 *                         $ref: '#/components/schemas/Playlist'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', asyncHandler(playlistsController.list));

/**
 * @openapi
 * /playlists:
 *   post:
 *     tags: [Playlists]
 *     summary: Create a new playlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *                 example: My Trap Beats
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Playlist created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Playlist'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', validate({ body: createPlaylistBodySchema }), asyncHandler(playlistsController.create));

/**
 * @openapi
 * /playlists/{id}/add:
 *   post:
 *     tags: [Playlists]
 *     summary: Add a beat to a playlist
 *     description: The beat must be published (status=1). Returns 409 if the beat is already in the playlist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Playlist ID
 *         example: 1
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
 *                 pattern: '^\d+$'
 *                 example: '42'
 *     responses:
 *       201:
 *         description: Beat added to playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Beat is already in the playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/:id/add',
  validate({ params: playlistIdParamSchema, body: addBeatToPlaylistBodySchema }),
  asyncHandler(playlistsController.addBeat),
);

/**
 * @openapi
 * /playlists/{id}/remove/{beatId}:
 *   delete:
 *     tags: [Playlists]
 *     summary: Remove a beat from a playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Playlist ID
 *         example: 1
 *       - in: path
 *         name: beatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Beat (item) ID
 *         example: 42
 *     responses:
 *       200:
 *         description: Beat removed from playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id/remove/:beatId',
  validate({ params: playlistBeatParamSchema }),
  asyncHandler(playlistsController.removeBeat),
);

export default router;
