import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as userController from './controller';
import { updateProfileBodySchema, changePasswordBodySchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(userController.getMe));
router.patch('/me', validate({ body: updateProfileBodySchema }), asyncHandler(userController.updateMe));
router.post('/me/change-password', validate({ body: changePasswordBodySchema }), asyncHandler(userController.changePassword));

export default router;
