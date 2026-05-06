import type { Prisma, User } from '@prisma/client';
import { ROLES, type Role } from '@constants/roles';
import { Errors } from '@utils/api-error';
import { uploadAvatar, deleteAvatar } from '@utils/storage';
import * as userRepo from './repository';
import type { UpdateProfileInput } from './validation';

export interface ProfileUser {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  email: string | null;
  role: Role;
  avatar: string | null;
  profile_heading: string | null;
  profile_description: string | null;
  profile_contact_email: string | null;
  profile_social_links: Record<string, string> | null;
  is_author: boolean;
  total_sales: number;
  total_followers: number;
  total_following: number;
  email_verified: boolean;
  createdAt: Date | null;
}

function userRole(user: User): Role {
  return user.is_author ? ROLES.PRODUCER : ROLES.USER;
}

function parseSocialLinks(raw: string | null): Record<string, string> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

function toProfileUser(user: User): ProfileUser {
  return {
    id: user.id.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    role: userRole(user),
    avatar: user.avatar,
    profile_heading: user.profile_heading,
    profile_description: user.profile_description,
    profile_contact_email: user.profile_contact_email,
    profile_social_links: parseSocialLinks(user.profile_social_links),
    is_author: user.is_author,
    total_sales: Number(user.total_sales),
    total_followers: Number(user.total_followers),
    total_following: Number(user.total_following),
    email_verified: user.email_verified_at !== null,
    createdAt: user.createdAt,
  };
}

export async function getProfile(userId: string): Promise<ProfileUser> {
  const user = await userRepo.findById(userId);
  if (!user) throw Errors.notFound({ resource: 'user' });
  return toProfileUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileUser> {
  if (input.username != null) {
    const existing = await userRepo.findByUsername(input.username);
    if (existing && existing.id.toString() !== userId) {
      throw Errors.conflict({ field: 'username' });
    }
  }

  const data: Prisma.UserUpdateInput = {};
  if (input.firstname !== undefined) data.firstname = input.firstname;
  if (input.lastname !== undefined) data.lastname = input.lastname;
  if ('username' in input) data.username = input.username;
  if ('profile_heading' in input) data.profile_heading = input.profile_heading;
  if ('profile_description' in input) data.profile_description = input.profile_description;
  if ('profile_contact_email' in input) data.profile_contact_email = input.profile_contact_email;
  if ('profile_social_links' in input) {
    data.profile_social_links = input.profile_social_links
      ? JSON.stringify(input.profile_social_links)
      : null;
  }

  const user = await userRepo.update(userId, data);
  return toProfileUser(user);
}

export async function updateAvatar(
  userId: string,
  file: Express.Multer.File,
): Promise<ProfileUser> {
  const currentUser = await userRepo.findById(userId);
  if (!currentUser) throw Errors.notFound({ resource: 'user' });

  const avatarUrl = await 
  uploadAvatar(file.buffer, file.originalname, file.mimetype, userId);

  if (currentUser.avatar) {
    deleteAvatar(currentUser.avatar).catch(() => undefined);
  }

  const user = await userRepo.update(userId, { avatar: avatarUrl });
  return toProfileUser(user);
}
