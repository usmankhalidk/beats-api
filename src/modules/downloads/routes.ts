import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as downloadsController from './controller';
import { downloadIdParamSchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/:id', validate({ params: downloadIdParamSchema }), asyncHandler(downloadsController.get));

export default router;
