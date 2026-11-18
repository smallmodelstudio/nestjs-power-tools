import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export interface ResponseEnvelope<T> {
  data: T;
}

/** Wraps every response body in `{ data }`. */
@Injectable()
export class TransformInterceptor<T = unknown> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
