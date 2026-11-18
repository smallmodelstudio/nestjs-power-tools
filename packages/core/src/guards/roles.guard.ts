import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthenticatedRequest, UserWithRoles } from '../core.types.js';

/**
 * Allows the request when `request.user.roles` contains any role required by
 * `@Roles(...)`. Routes without `@Roles` are allowed. Register it after `AuthGuard`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest<AuthenticatedRequest<UserWithRoles>>().user;
    return required.some((role) => user?.roles?.includes(role));
  }
}
