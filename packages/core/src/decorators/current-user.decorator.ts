import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../core.types.js';

export function currentUserFactory(data: string | undefined, ctx: ExecutionContext): unknown {
  const user = ctx.switchToHttp().getRequest<AuthenticatedRequest<Record<string, unknown>>>().user;
  return data ? user?.[data] : user;
}

/**
 * Injects `request.user`, or one of its properties: `@CurrentUser()` or `@CurrentUser('id')`.
 * The user is set by `AuthGuard`.
 */
export const CurrentUser = createParamDecorator(currentUserFactory);
