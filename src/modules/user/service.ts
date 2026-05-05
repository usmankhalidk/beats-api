import { Errors } from '@utils/api-error';
import type { UpdateAvatarInput, UpdateProfileInput } from './validation';

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

export async function updateAvatar(_userId: string, _input: UpdateAvatarInput): Promise<PublicUser> {
  throw Errors.notImplemented({ feature: 'user.updateAvatar' });
}
