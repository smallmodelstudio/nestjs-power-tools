# @nestjs-power-tools/http

The [NestJS HTTP module](https://docs.nestjs.com/techniques/http-module) recipe: an axios-backed `HttpService` with built-in **retry and backoff**.

## Install

```bash
pnpm add @nestjs-power-tools/http @nestjs/axios axios rxjs
```

Peers: `@nestjs/axios` (>=4), `@nestjs/common` (>=11), `axios` (>=1.3.1), `rxjs` (>=7).

## Quick start

```ts
import { HttpClientModule } from '@nestjs-power-tools/http';

@Module({
  imports: [
    HttpClientModule.register({
      options: {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        retry: { retries: 3, delay: 200 },
      },
    }),
  ],
})
export class AppModule {}
```

Then inject the standard `HttpService` from `@nestjs/axios`:

```ts
@Injectable()
export class ApiService {
  constructor(private readonly http: HttpService) {}

  getUser(id: string) {
    return firstValueFrom(this.http.get(`/users/${id}`));
  }
}
```

Async config: `HttpClientModule.registerAsync({ useFactory, inject, imports, isGlobal })`.

## Retry options

Pass `retry` alongside any axios config. Omit it (or `false`) for no retries.

| Option        | Default                       | Notes                                                         |
| ------------- | ----------------------------- | ------------------------------------------------------------- |
| `retries`     | `3`                           | Retries after the first attempt.                              |
| `delay`       | `200` ms                      | Exponential backoff: `delay × 2^(attempt-1)`. `0` = no wait.  |
| `maxDelay`    | `5000` ms                     | Cap for a single wait.                                        |
| `methods`     | `get head options put delete` | Lower-case. POST/PATCH are excluded by default.               |
| `statuses`    | `408 429 500 502 503 504`     | Network errors and timeouts always qualify.                   |
| `shouldRetry` | -                             | `(error, attempt) => boolean`; replaces the default decision. |
| `onRetry`     | -                             | `(error, attempt, delayMs) => void`; use for logging.         |

```ts
retry: { methods: ['get', 'post'], onRetry: (e, n) => logger.warn(`retry ${n}: ${e.message}`) }
```

## Other exports

- `createHttpService(options)`: build an `HttpService` outside Nest's DI.
- `attachRetry(axiosInstance, retryOptions)`: add retries to any axios instance.

## Good to know

- Only retry POST/PATCH on endpoints that are safe to repeat.
- No jitter and no `Retry-After` support. Retry config is per client, not per request.
