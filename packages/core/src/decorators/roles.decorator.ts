import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restricts a route (or controller) to users holding at least one of the roles. See `RolesGuard`. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
