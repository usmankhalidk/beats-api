import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as userController from './controller';
import { updateAvatarBodySchema, updateProfileBodySchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', validate({ body: updateProfileBodySchema }), asyncHandler(userController.updateProfile));
router.put(
  '/profile/avatar',
  validate({ body: updateAvatarBodySchema }),
  asyncHandler(userController.updateAvatar),
);

export default router;
