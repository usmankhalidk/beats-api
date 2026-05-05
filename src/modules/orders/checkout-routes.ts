import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as ordersController from './controller';
import { checkoutBodySchema } from './validation';

/**
 * Mounted at the API root as POST /checkout (per contract — not nested under /orders).
 * Returns NOT_IMPLEMENTED until a payment provider is wired in.
 */
const router = Router();

router.post(
  '/',
  authenticate,
  validate({ body: checkoutBodySchema }),
  asyncHandler(ordersController.checkout),
);

export default router;
