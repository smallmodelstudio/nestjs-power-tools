# @nestjs-power-tools/core

Reusable NestJS building blocks: decorators, guards, pipes and interceptors.

## Install

```bash
pnpm add @nestjs-power-tools/core
```

Peers: `@nestjs/common`, `@nestjs/core` (>=11), `reflect-metadata`, `rxjs`. HTTP only (guards use `switchToHttp()`).

## Quick start: auth + roles

Provide a verifier (your auth strategy), then register the guards globally.

```ts
import { APP_GUARD } from '@nestjs/core';
import { AUTH_VERIFIER, AuthGuard, RolesGuard, extractBearerToken } from '@nestjs-power-tools/core';

@Module({
  providers: [
    {
      provide: AUTH_VERIFIER,
      useValue: {
        verify: (req) => {
          const token = extractBearerToken(req);
          return token ? myJwt.verify(token) : undefined; // return the user, or nothing to reject
        },
      },
    },
    { provide: APP_GUARD, useClass: AuthGuard }, // order matters: auth first,
    { provide: APP_GUARD, useClass: RolesGuard }, // then roles
  ],
})
export class AppModule {}
```

```ts
@Controller('users')
export class UsersController {
  @Public()
  @Get('health')
  health() {}

  @Roles('admin')
  @Get('me')
  me(@CurrentUser() user: User, @CurrentUser('id') id: string) {}
}
```

## What's included

| Folder          | Export                          | Behaviour                                                                       |
| --------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `decorators/`   | `@Public()`                     | Skips `AuthGuard` for the route/controller.                                     |
|                 | `@Roles(...roles)`              | Requires any one of the roles.                                                  |
|                 | `@CurrentUser(key?)`            | Injects `request.user` or `request.user[key]`.                                  |
| `guards/`       | `AuthGuard`                     | Runs your `AUTH_VERIFIER`, sets `request.user`, 401 if it returns nothing.      |
|                 | `RolesGuard`                    | Checks `request.user.roles`; routes without `@Roles` pass. Returns 403 on fail. |
|                 | `extractBearerToken(request)`   | Reads `Authorization: Bearer <token>`.                                          |
| `pipes/`        | `ZodValidationPipe(schema)`     | Parses with a zod schema; 400 with `issues` on failure. Needs only `safeParse`. |
|                 | `ParseUUIDPipe`                 | Nest's pipe, defaulting to UUID v4.                                             |
| `interceptors/` | `TransformInterceptor`          | Wraps responses as `{ data }`.                                                  |
|                 | `TimeoutInterceptor(ms = 5000)` | 408 if the handler is too slow.                                                 |

```ts
@Post()
create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUser) {}

@Get(':id')
find(@Param('id', ParseUUIDPipe) id: string) {}

@UseInterceptors(TransformInterceptor, new TimeoutInterceptor(2000))
@Get()
list() {}
```

## Good to know

- Pass a user object with a `roles: string[]` field for `RolesGuard` to work.
- Use `@UseInterceptors(TimeoutInterceptor)` (class) for the 5 s default, or `new TimeoutInterceptor(ms)` to set it.
