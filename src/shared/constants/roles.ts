import { UserRole } from '@prisma/client';

export const ROLES = {
  USER: UserRole.user,
  PRODUCER: UserRole.producer,
  ADMIN: UserRole.admin,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.USER, ROLES.PRODUCER, ROLES.ADMIN];
