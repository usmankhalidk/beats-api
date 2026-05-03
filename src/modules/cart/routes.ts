import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as cartController from './controller';
import { addCartItemBodySchema, cartItemIdParamSchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(cartController.list));
router.post('/items', validate({ body: addCartItemBodySchema }), asyncHandler(cartController.add));
router.delete('/items/:id', validate({ params: cartItemIdParamSchema }), asyncHandler(cartController.remove));
router.delete('/', asyncHandler(cartController.clear));

export default router;
