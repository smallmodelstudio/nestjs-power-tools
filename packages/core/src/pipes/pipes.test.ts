import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ParseUUIDPipe, ZodValidationPipe } from './index.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string(), age: z.coerce.number() }));

  it('returns parsed data', () => {
    expect(pipe.transform({ name: 'a', age: '3' })).toEqual({ name: 'a', age: 3 });
  });

  it('throws 400 with issues', () => {
    try {
      pipe.transform({ name: 1 });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as BadRequestException).getResponse()).toMatchObject({
        message: 'Validation failed',
        issues: expect.any(Array),
      });
    }
  });
});

describe('ParseUUIDPipe', () => {
  const pipe = new ParseUUIDPipe();
  const meta = { type: 'param' as const };

  it('accepts a v4 uuid and rejects others', async () => {
    const id = '3b2f0c3e-5a4d-4f6b-9a1e-0c1d2e3f4a5b';
    await expect(pipe.transform(id, meta)).resolves.toBe(id);
    await expect(pipe.transform('nope', meta)).rejects.toThrow(BadRequestException);
  });
});
