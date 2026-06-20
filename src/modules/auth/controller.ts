import type { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { Errors } from '@utils/api-error';
import { HTTP_STATUS } from '@constants/http-status';
import * as authService from './service';

export async function register(req: Request, res: Response): Promise<Response> {
  const result = await authService.register(req.body);
  return successResponse(res, { data: result, message: 'VERIFICATION_EMAIL_SENT', code: HTTP_STATUS.CREATED });
}

export async function login(req: Request, res: Response): Promise<Response> {
  const result = await authService.login(req.body);
  return successResponse(res, { data: result, message: 'LOGGED_IN' });
}

export async function googleSignIn(req: Request, res: Response): Promise<Response> {
  const result = await authService.googleSignIn(req.body);
  return successResponse(res, { data: result, message: 'LOGGED_IN' });
}

export async function logout(req: Request, res: Response): Promise<Response> {
  await authService.logout(req.body);
  return successResponse(res, { data: null, message: 'LOGGED_OUT' });
}

export async function refresh(req: Request, res: Response): Promise<Response> {
  const tokens = await authService.refreshTokens(req.body);
  return successResponse(res, { data: tokens, message: 'TOKENS_REFRESHED' });
}

export async function forgotPassword(req: Request, res: Response): Promise<Response> {
  const result = await authService.forgotPassword(req.body);
  return successResponse(res, { data: result, message: 'PASSWORD_RESET_LINK_ISSUED' });
}

export async function resetPassword(req: Request, res: Response): Promise<Response> {
  await authService.resetPassword(req.body);
  return successResponse(res, { data: null, message: 'PASSWORD_RESET' });
}

export async function changePassword(req: Request, res: Response): Promise<Response> {
  if (!req.user) throw Errors.unauthorized();
  const tokens = await authService.changePassword(req.user.id, req.body);
  return successResponse(res, { data: { tokens }, message: 'PASSWORD_CHANGED' });
}

export async function verifyEmail(req: Request, res: Response): Promise<Response> {
  const result = await authService.verifyEmail(req.body.token);
  return successResponse(res, { data: result, message: 'EMAIL_VERIFIED' });
}

export async function resendVerification(req: Request, res: Response): Promise<Response> {
  const result = await authService.resendVerification(req.body.email);
  return successResponse(res, { data: result, message: 'VERIFICATION_EMAIL_SENT' });
}
