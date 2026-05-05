import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { requireRoles } from '@middleware/role';
import { validate } from '@middleware/validate';
import { ROLES } from '@constants/roles';
import * as dashboardController from './controller';
import { earningsQuerySchema, salesQuerySchema } from './validation';

const router = Router();

router.use(authenticate);
router.use(requireRoles(ROLES.PRODUCER, ROLES.ADMIN));

router.get('/earnings', validate({ query: earningsQuerySchema }), asyncHandler(dashboardController.earnings));
router.get('/sales', validate({ query: salesQuerySchema }), asyncHandler(dashboardController.sales));

export default router;
