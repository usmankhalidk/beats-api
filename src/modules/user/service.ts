import { Errors } from '@utils/api-error';
import type { UpdateProfileInput, ChangePasswordInput } from './validation';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

export async function getProfile(_userId: string): Promise<PublicUser> {
  throw Errors.notImplemented({ feature: 'user.getProfile' });
}

export async function updateProfile(_userId: string, _input: UpdateProfileInput): Promise<PublicUser> {
  throw Errors.notImplemented({ feature: 'user.updateProfile' });
}

export async function changePassword(_userId: string, _input: ChangePasswordInput): Promise<void> {
  throw Errors.notImplemented({ feature: 'user.changePassword' });
}
