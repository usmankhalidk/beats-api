import type { Prisma, User } from '@prisma/client';
import { type Role } from '@constants/roles';
import { Errors } from '@utils/api-error';
import { uploadAvatar, deleteAvatar } from '@utils/storage';
import * as userRepo from './repository';
import type { UpdateProfileInput } from './validation';

export interface ProfileUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string | null;
  role: Role;
  avatar: string | null;
  profileHeading: string | null;
  profileDescription: string | null;
  profileContactEmail: string | null;
  profileSocialLinks: Record<string, string> | null;
  totalSales: number;
  totalFollowers: number;
  totalFollowing: number;
  emailVerified: boolean;
  createdAt: Date | null;
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
    firstName: user.firstname,
    lastName: user.lastname,
    userName: user.username,
    email: user.email,
    role: user.role as Role,
    avatar: user.avatar,
    profileHeading: user.profile_heading,
    profileDescription: user.profile_description,
    profileContactEmail: user.profile_contact_email,
    profileSocialLinks: parseSocialLinks(user.profile_social_links),
    totalSales: Number(user.total_sales),
    totalFollowers: Number(user.total_followers),
    totalFollowing: Number(user.total_following),
    emailVerified: user.email_verified_at !== null,
    createdAt: user.createdAt,
  };
}

export async function getProfile(userId: string): Promise<ProfileUser> {
  const user = await userRepo.findById(userId);
  if (!user) throw Errors.notFound({ resource: 'user' });
  return toProfileUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileUser> {
  if (input.userName != null) {
    const existing = await userRepo.findByUsername(input.userName);
    if (existing && existing.id.toString() !== userId) {
      throw Errors.conflict({ field: 'userName' });
    }
  }

  const data: Prisma.UserUpdateInput = {};
  if (input.firstName !== undefined) data.firstname = input.firstName;
  if (input.lastName !== undefined) data.lastname = input.lastName;
  if ('userName' in input) data.username = input.userName;
  if ('profileHeading' in input) data.profile_heading = input.profileHeading;
  if ('profileDescription' in input) data.profile_description = input.profileDescription;
  if ('profileContactEmail' in input) data.profile_contact_email = input.profileContactEmail;
  if ('profileSocialLinks' in input) {
    data.profile_social_links = input.profileSocialLinks
      ? JSON.stringify(input.profileSocialLinks)
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
