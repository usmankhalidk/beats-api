import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate, optionalAuthenticate } from '@middleware/auth';
import { requireRoles } from '@middleware/role';
import { validate } from '@middleware/validate';
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

/**
 * IMPORTANT: literal sub-routes (/search, /filter, /featured, /free) must be
 * declared BEFORE /:id, otherwise Express matches them as ids.
 */
router.get(
  '/search',
  optionalAuthenticate,
  validate({ query: searchBeatsQuerySchema }),
  asyncHandler(beatsController.search),
);
router.get(
  '/filter',
  optionalAuthenticate,
  validate({ query: filterBeatsQuerySchema }),
  asyncHandler(beatsController.filter),
);
router.get(
  '/featured',
  optionalAuthenticate,
  validate({ query: featuredBeatsQuerySchema }),
  asyncHandler(beatsController.featured),
);
router.get(
  '/free',
  optionalAuthenticate,
  validate({ query: freeBeatsQuerySchema }),
  asyncHandler(beatsController.free),
);

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

// Producer-only writes
router.post(
  '/',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ body: createBeatBodySchema }),
  asyncHandler(beatsController.create),
);
router.put(
  '/:id',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ params: idParamSchema, body: replaceBeatBodySchema }),
  asyncHandler(beatsController.replace),
);
router.delete(
  '/:id',
  authenticate,
  requireRoles(ROLES.PRODUCER, ROLES.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(beatsController.remove),
);

export default router;
