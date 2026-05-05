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

router.get(
  '/',
  optionalAuthenticate,
  validate({ query: listCategoriesQuerySchema }),
  asyncHandler(categoriesController.list),
);

router.get(
  '/:slug/beats',
  optionalAuthenticate,
  validate({ params: slugParamSchema, query: categoryBeatsQuerySchema }),
  asyncHandler(categoriesController.listBeats),
);

export default router;
