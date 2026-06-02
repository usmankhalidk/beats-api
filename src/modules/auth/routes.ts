import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
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
  changePasswordBodySchema,
  verifyEmailBodySchema,
  resendVerificationBodySchema,
} from './validation';

const router = Router();

router.use(authRateLimiter);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates the account and immediately sends a verification email via Resend. Login is blocked until the email is verified. In dev/staging the verificationToken is returned in the response body for easy testing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
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
 *                 pattern: '^[a-zA-Z0-9_.-]+$'
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 enum: [user, producer]
 *                 default: user
 *                 example: producer
 *     responses:
 *       201:
 *         description: Registration successful — verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Empty in production. In dev/staging the verificationToken is included for testing.
 *                       properties:
 *                         verificationToken:
 *                           type: string
 *                           description: Only present in non-production environments
 *       409:
 *         description: Email or username already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register', validate({ body: registerBodySchema }), asyncHandler(authController.register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/UserProfile'
 *                         tokens:
 *                           $ref: '#/components/schemas/TokenPair'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Email not verified, or account disabled. `details.reason` is `email_not_verified` or `account_disabled`.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/login', validate({ body: loginBodySchema }), asyncHandler(authController.login));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: '{{refreshToken}}'
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/logout', validate({ body: logoutBodySchema }), asyncHandler(authController.logout));

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new token pair
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: '{{refreshToken}}'
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokenPair'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/refresh-token', validate({ body: refreshTokenBodySchema }), asyncHandler(authController.refresh));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token
 *     description: Sends a password reset link to the provided email via Resend. Always returns 200 to prevent email enumeration. In dev/staging the resetToken is included in the response for testing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Reset token issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/forgot-password', validate({ body: forgotPasswordBodySchema }), asyncHandler(authController.forgotPassword));

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a reset token
 *     description: Revokes all existing sessions. You must login again afterwards.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               token:
 *                 type: string
 *                 example: '{{resetToken}}'
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/reset-password', validate({ body: resetPasswordBodySchema }), asyncHandler(authController.resetPassword));

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change the authenticated user's password
 *     description: |
 *       Verifies the current password, updates to the new one, then revokes every
 *       existing refresh token for this user. A fresh access/refresh token pair is
 *       returned so the calling device stays signed in — every other device must log in again.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Password123!
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: NewPassword456!
 *     responses:
 *       200:
 *         description: Password changed successfully; new token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         tokens:
 *                           $ref: '#/components/schemas/TokenPair'
 *       401:
 *         description: Missing/invalid bearer token, or currentPassword is wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordBodySchema }),
  asyncHandler(authController.changePassword),
);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email address using the token from the verification email
 *     description: |
 *       Validates the one-time token delivered to the user's email via Resend on registration or resend.
 *       On success the email is marked verified and a full token pair is returned so the
 *       user is immediately logged in. The token expires after 24 hours by default
 *       (configurable via `EMAIL_VERIFICATION_TTL_MINUTES`).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: '{{verificationToken}}'
 *     responses:
 *       200:
 *         description: Email verified — user is now logged in
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/UserProfile'
 *                         tokens:
 *                           $ref: '#/components/schemas/TokenPair'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/verify-email', validate({ body: verifyEmailBodySchema }), asyncHandler(authController.verifyEmail));

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend the email verification link
 *     description: |
 *       Sends a fresh verification email via Resend. Safe to call even if the email does not exist
 *       (returns 200 either way to prevent email enumeration). Returns 409 if the email
 *       is already verified. In dev/staging the new token is included in the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Verification email sent (or silently no-op if email not found)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         verificationToken:
 *                           type: string
 *                           description: Only present in non-production environments
 *       409:
 *         description: Email is already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/resend-verification', validate({ body: resendVerificationBodySchema }), asyncHandler(authController.resendVerification));

export default router;
