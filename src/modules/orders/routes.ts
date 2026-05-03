import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as ordersController from './controller';
import { checkoutBodySchema, listOrdersQuerySchema, orderIdParamSchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: listOrdersQuerySchema }), asyncHandler(ordersController.list));
router.get('/:id', validate({ params: orderIdParamSchema }), asyncHandler(ordersController.get));
router.post('/checkout', validate({ body: checkoutBodySchema }), asyncHandler(ordersController.checkout));

export default router;
