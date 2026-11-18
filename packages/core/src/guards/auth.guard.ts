import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedRequest } from '../core.types.js';

export const AUTH_VERIFIER = Symbol('AUTH_VERIFIER');

/**
 * Supplies the authentication strategy. Return the user for a valid request;
 * throw (or return a falsy value) otherwise. Provide it under `AUTH_VERIFIER`.
 */
export interface AuthVerifier<TUser = unknown> {
  verify(
    request: AuthenticatedRequest<TUser>,
  ): TUser | null | undefined | Promise<TUser | null | undefined>;
}

/** Pulls the token out of an `Authorization: Bearer <token>` header. */
export function extractBearerToken(
  request: Pick<AuthenticatedRequest, 'headers'>,
): string | undefined {
  const header = request.headers['authorization'];
  const value = Array.isArray(header) ? header[0] : header;
  const [type, token] = value?.split(' ') ?? [];
  return type?.toLowerCase() === 'bearer' && token ? token : undefined;
}

/**
 * Authenticates every request through the `AUTH_VERIFIER` provider and stores
 * the result on `request.user`. Routes marked `@Public()` are skipped.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AUTH_VERIFIER) private readonly verifier: AuthVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.verifier.verify(request);
    if (!user) throw new UnauthorizedException();

    request.user = user;
    return true;
  }
}
