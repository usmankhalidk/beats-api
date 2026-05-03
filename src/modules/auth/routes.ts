import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { validate } from '@middleware/validate';
import { authRateLimiter } from '@middleware/rate-limit';
import * as authController from './controller';
import {
  registerBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshTokenBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} from './validation';

const router = Router();

router.use(authRateLimiter);

router.post('/register', validate({ body: registerBodySchema }), asyncHandler(authController.register));
router.post('/login', validate({ body: loginBodySchema }), asyncHandler(authController.login));
router.post('/logout', validate({ body: logoutBodySchema }), asyncHandler(authController.logout));
router.post('/refresh-token', validate({ body: refreshTokenBodySchema }), asyncHandler(authController.refresh));
router.post('/forgot-password', validate({ body: forgotPasswordBodySchema }), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validate({ body: resetPasswordBodySchema }), asyncHandler(authController.resetPassword));

export default router;
