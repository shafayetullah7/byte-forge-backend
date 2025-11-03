export const RolesObj = {
  ADMIN: 'admin',
  //   MANAGER: 'manager',
  //   SELLER: 'seller',
  USER: 'user',
} as const;

// Type representing any valid role
export type Role = (typeof RolesObj)[keyof typeof RolesObj];

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
