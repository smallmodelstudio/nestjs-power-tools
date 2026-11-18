import { RequestTimeoutException } from '@nestjs/common';
import { delay, firstValueFrom, of, throwError } from 'rxjs';
import { TimeoutInterceptor, TransformInterceptor } from './index.js';

const ctx: any = {};
const handler = (obs: any) => ({ handle: () => obs });

describe('TransformInterceptor', () => {
  it('wraps the body in { data }', async () => {
    const out = new TransformInterceptor().intercept(ctx, handler(of({ a: 1 })));
    await expect(firstValueFrom(out)).resolves.toEqual({ data: { a: 1 } });
  });
});

describe('TimeoutInterceptor', () => {
  it('passes fast responses through', async () => {
    const out = new TimeoutInterceptor(50).intercept(ctx, handler(of('ok')));
    await expect(firstValueFrom(out)).resolves.toBe('ok');
  });

  it('throws 408 when too slow', async () => {
    const out = new TimeoutInterceptor(10).intercept(ctx, handler(of('ok').pipe(delay(100))));
    await expect(firstValueFrom(out)).rejects.toThrow(RequestTimeoutException);
  });

  it('keeps other errors', async () => {
    const out = new TimeoutInterceptor(50).intercept(
      ctx,
      handler(throwError(() => new Error('x'))),
    );
    await expect(firstValueFrom(out)).rejects.toThrow('x');
  });
});
