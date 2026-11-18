import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public, Roles } from '../decorators/index.js';
import { AuthGuard, RolesGuard, extractBearerToken } from './index.js';

class Plain {
  open() {}
  @Public()
  pub() {}
  @Roles('admin')
  admin() {}
}

function context(handler: Function, request: any): any {
  return {
    getHandler: () => handler,
    getClass: () => Plain,
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

describe('AuthGuard', () => {
  const reflector = new Reflector();

  it('authenticates and sets request.user', async () => {
    const guard = new AuthGuard(reflector, { verify: () => ({ id: 1 }) });
    const req: any = { headers: {} };
    await expect(guard.canActivate(context(Plain.prototype.open, req))).resolves.toBe(true);
    expect(req.user).toEqual({ id: 1 });
  });

  it('rejects when the verifier returns nothing', async () => {
    const guard = new AuthGuard(reflector, { verify: () => undefined });
    await expect(guard.canActivate(context(Plain.prototype.open, { headers: {} }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('skips @Public routes', async () => {
    const verify = vi.fn();
    const guard = new AuthGuard(reflector, { verify });
    await expect(guard.canActivate(context(Plain.prototype.pub, { headers: {} }))).resolves.toBe(
      true,
    );
    expect(verify).not.toHaveBeenCalled();
  });
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows routes without roles', () => {
    expect(guard.canActivate(context(Plain.prototype.open, { headers: {} }))).toBe(true);
  });

  it('checks the user roles', () => {
    const allowed = { headers: {}, user: { roles: ['admin'] } };
    const denied = { headers: {}, user: { roles: ['user'] } };
    expect(guard.canActivate(context(Plain.prototype.admin, allowed))).toBe(true);
    expect(guard.canActivate(context(Plain.prototype.admin, denied))).toBe(false);
    expect(guard.canActivate(context(Plain.prototype.admin, { headers: {} }))).toBe(false);
  });
});

describe('extractBearerToken', () => {
  it('reads the bearer token', () => {
    expect(extractBearerToken({ headers: { authorization: 'Bearer abc' } })).toBe('abc');
    expect(extractBearerToken({ headers: { authorization: 'Basic abc' } })).toBeUndefined();
    expect(extractBearerToken({ headers: {} })).toBeUndefined();
  });
});
