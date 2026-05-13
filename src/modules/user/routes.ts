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

/**
 * @openapi
 * /user/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/profile', asyncHandler(userController.getProfile));

/**
 * @openapi
 * /user/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: John
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: Doe
 *               userName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 nullable: true
 *                 example: johndoe
 *               profileHeading:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: Producer & Beatmaker
 *               profileDescription:
 *                 type: string
 *                 maxLength: 5000
 *                 nullable: true
 *                 example: NYC-based producer specialising in trap and drill.
 *               profileContactEmail:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *                 example: contact@johndoe.com
 *               profileSocialLinks:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   twitter:
 *                     type: string
 *                     format: uri
 *                   instagram:
 *                     type: string
 *                     format: uri
 *                   facebook:
 *                     type: string
 *                     format: uri
 *                   youtube:
 *                     type: string
 *                     format: uri
 *                   soundcloud:
 *                     type: string
 *                     format: uri
 *                   spotify:
 *                     type: string
 *                     format: uri
 *                   website:
 *                     type: string
 *                     format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put(
  '/profile',
  validate({ body: updateProfileBodySchema }),
  asyncHandler(userController.updateProfile),
);

/**
 * @openapi
 * /user/profile/avatar:
 *   put:
 *     tags: [Users]
 *     summary: Upload a profile avatar
 *     description: Accepts multipart/form-data. Field name must be `avatar`. Max 5 MB. Supported types — JPEG, PNG, WebP, GIF.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/profile/avatar', handleAvatarUpload, asyncHandler(userController.updateAvatar));

export default router;
