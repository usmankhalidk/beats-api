export const ROLES = {
  USER: 'user',
  PRODUCER: 'producer',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.USER, ROLES.PRODUCER, ROLES.ADMIN];
