import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate, optionalAuthenticate } from '@middleware/auth';
import { requireRoles } from '@middleware/role';
import { validate } from '@middleware/validate';
import { ROLES } from '@constants/roles';
import * as beatsController from './controller';
import {
  createBeatBodySchema,
  idParamSchema,
  listBeatsQuerySchema,
  updateBeatBodySchema,
} from './validation';

const router = Router();

// Public reads (auth optional — used to mark "owned" flags later).
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: listBeatsQuerySchema }),
  asyncHandler(beatsController.list),
);
router.get(
  '/:id',
  optionalAuthenticate,
  validate({ params: idParamSchema }),
  asyncHandler(beatsController.get),
);

// Producer-only writes.
router.post(
  '/',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ body: createBeatBodySchema }),
  asyncHandler(beatsController.create),
);
router.patch(
  '/:id',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateBeatBodySchema }),
  asyncHandler(beatsController.update),
);
router.delete(
  '/:id',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(beatsController.remove),
);

export default router;
