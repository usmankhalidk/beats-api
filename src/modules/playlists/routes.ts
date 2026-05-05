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

router.get('/', asyncHandler(playlistsController.list));
router.post('/', validate({ body: createPlaylistBodySchema }), asyncHandler(playlistsController.create));
router.post(
  '/:id/add',
  validate({ params: playlistIdParamSchema, body: addBeatToPlaylistBodySchema }),
  asyncHandler(playlistsController.addBeat),
);
router.delete(
  '/:id/remove/:beatId',
  validate({ params: playlistBeatParamSchema }),
  asyncHandler(playlistsController.removeBeat),
);

export default router;
