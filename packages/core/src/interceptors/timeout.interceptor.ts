import {
  Injectable,
  RequestTimeoutException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError, timeout, TimeoutError, type Observable } from 'rxjs';

export const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Fails with 408 when the handler takes longer than `ms`.
 * `@UseInterceptors(TimeoutInterceptor)` uses the default;
 * `@UseInterceptors(new TimeoutInterceptor(1000))` sets it.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly ms: number = DEFAULT_TIMEOUT_MS) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.ms),
      catchError((err: unknown) =>
        throwError(() => (err instanceof TimeoutError ? new RequestTimeoutException() : err)),
      ),
    );
  }
}
