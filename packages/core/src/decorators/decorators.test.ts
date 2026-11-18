import 'reflect-metadata';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser, IS_PUBLIC_KEY, Public, ROLES_KEY, Roles } from './index.js';

class Controller {
  @Public()
  @Roles('admin', 'staff')
  handler(@CurrentUser('id') _id: string, @CurrentUser() _user: unknown) {}
}

const ctx = (user: unknown) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) });

describe('decorators', () => {
  it('sets Public and Roles metadata', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, Controller.prototype.handler)).toBe(true);
    expect(Reflect.getMetadata(ROLES_KEY, Controller.prototype.handler)).toEqual([
      'admin',
      'staff',
    ]);
  });

  it('CurrentUser returns the user or a property of it', () => {
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Controller, 'handler');
    const factories = Object.values<any>(args);
    const user = { id: '1', name: 'a' };
    const results = factories.map((f) => f.factory(f.data, ctx(user)));
    expect(results).toContain('1');
    expect(results).toContainEqual(user);
  });
});
