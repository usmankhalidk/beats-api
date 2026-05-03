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
  updatePlaylistBodySchema,
} from './validation';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(playlistsController.list));
router.post('/', validate({ body: createPlaylistBodySchema }), asyncHandler(playlistsController.create));
router.get('/:id', validate({ params: playlistIdParamSchema }), asyncHandler(playlistsController.get));
router.patch(
  '/:id',
  validate({ params: playlistIdParamSchema, body: updatePlaylistBodySchema }),
  asyncHandler(playlistsController.update),
);
router.delete('/:id', validate({ params: playlistIdParamSchema }), asyncHandler(playlistsController.remove));
router.post(
  '/:id/beats',
  validate({ params: playlistIdParamSchema, body: addBeatToPlaylistBodySchema }),
  asyncHandler(playlistsController.addBeat),
);
router.delete(
  '/:id/beats/:beatId',
  validate({ params: playlistBeatParamSchema }),
  asyncHandler(playlistsController.removeBeat),
);

export default router;
