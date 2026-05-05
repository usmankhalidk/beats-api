import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate as validateMw } from '@middleware/validate';
import * as ordersController from './controller';
import { listOrdersQuerySchema, orderIdParamSchema, validateOrderBodySchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/', validateMw({ query: listOrdersQuerySchema }), asyncHandler(ordersController.list));
router.post(
  '/validate',
  validateMw({ body: validateOrderBodySchema }),
  asyncHandler(ordersController.validate),
);
router.get('/:id', validateMw({ params: orderIdParamSchema }), asyncHandler(ordersController.get));

export default router;
