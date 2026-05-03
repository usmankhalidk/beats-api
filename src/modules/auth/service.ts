import { Errors } from '@utils/api-error';
import type {
  RegisterInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './validation';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionResult {
  user: { id: string; email: string; name: string; role: string };
  tokens: AuthTokens;
}

export async function register(_input: RegisterInput): Promise<AuthSessionResult> {
  throw Errors.notImplemented({ feature: 'auth.register' });
}

export async function login(_input: LoginInput): Promise<AuthSessionResult> {
  throw Errors.notImplemented({ feature: 'auth.login' });
}

export async function logout(_input: LogoutInput): Promise<void> {
  throw Errors.notImplemented({ feature: 'auth.logout' });
}

export async function refreshTokens(_input: RefreshTokenInput): Promise<AuthTokens> {
  throw Errors.notImplemented({ feature: 'auth.refresh' });
}

export async function forgotPassword(_input: ForgotPasswordInput): Promise<{ resetLink: string }> {
  throw Errors.notImplemented({ feature: 'auth.forgotPassword' });
}

export async function resetPassword(_input: ResetPasswordInput): Promise<void> {
  throw Errors.notImplemented({ feature: 'auth.resetPassword' });
}
