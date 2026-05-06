import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { Errors } from '@utils/api-error';
import * as userController from './controller';
import { updateProfileBodySchema } from './validation';

const router = Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

function handleAvatarUpload(req: Request, res: Response, next: NextFunction): void {
  avatarUpload.single('avatar')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(
        err.code === 'LIMIT_FILE_SIZE'
          ? Errors.badRequest({ reason: 'file_too_large', maxSize: '5MB' })
          : Errors.badRequest({ reason: err.code }),
      );
      return;
    }
    if (err instanceof Error) {
      next(Errors.badRequest({ reason: err.message }));
      return;
    }
    next();
  });
}

router.use(authenticate);

router.get('/profile', asyncHandler(userController.getProfile));
router.put(
  '/profile',
  validate({ body: updateProfileBodySchema }),
  asyncHandler(userController.updateProfile),
);
router.put('/profile/avatar', handleAvatarUpload, asyncHandler(userController.updateAvatar));

export default router;
