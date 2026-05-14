import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validate';
import * as downloadsController from './controller';
import { downloadIdParamSchema } from './validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /downloads/{id}:
 *   get:
 *     tags: [Downloads]
 *     summary: Get a signed download URL for a purchased beat
 *     description: |
 *       Returns a pre-signed S3 URL valid for 1 hour that lets the caller
 *       download the beat audio file. The `id` is the **purchase ID**
 *       (`purchases.id`), not the beat ID — this ensures the correct
 *       license is resolved. Returns 404 if the purchase does not belong
 *       to the authenticated user or if the beat file has not been uploaded yet.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase ID (from purchases table)
 *         example: '01935678-1234-7890-abcd-1234567890ab'
 *     responses:
 *       200:
 *         description: Signed download URL
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DownloadGrant'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/:id', validate({ params: downloadIdParamSchema }), asyncHandler(downloadsController.get));

export default router;
