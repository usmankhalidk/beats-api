import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as paymentsService from './service';

function requireUserId(req: Request): string {
  if (!req.user) throw Errors.unauthorized();
  return req.user.id;
}

export async function createSession(req: Request, res: Response): Promise<Response> {
  const data = await paymentsService.createCheckoutSession(requireUserId(req), req.body);
  return successResponse(res, { data, message: 'CHECKOUT_CREATED', code: HTTP_STATUS.CREATED });
}

export async function getPage(req: Request, res: Response): Promise<Response> {
  const data = await paymentsService.getCheckoutPage(requireUserId(req), String(req.params['id']));
  return successResponse(res, { data });
}

export async function pay(req: Request, res: Response): Promise<Response> {
  const data = await paymentsService.payForCheckout(
    requireUserId(req),
    String(req.params['id']),
    req.body,
  );
  return successResponse(res, { data, message: 'PAYMENT_INITIALIZED' });
}

/**
 * Authoritative payment status for the Flutter app to poll after sending the
 * buyer to the gateway. Confirmation itself is webhook-driven; this just reports
 * the verified result our backend already holds (self-healing if the webhook is
 * delayed). No reliance on gateway redirect/callback URLs.
 */
export async function getStatus(req: Request, res: Response): Promise<Response> {
  const data = await paymentsService.getPaymentStatus(requireUserId(req), String(req.params['id']));
  return successResponse(res, { data, message: 'PAYMENT_STATUS' });
}
