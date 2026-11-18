import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

/** Structural subset of a zod schema, so zod stays an optional dependency. */
export interface ZodLikeSchema<T = unknown> {
  safeParse(
    value: unknown,
  ): { success: true; data: T } | { success: false; error: { issues: unknown[] } };
}

/**
 * Validates and parses a value with a zod schema, e.g.
 * `@Body(new ZodValidationPipe(createUserSchema))`. Throws 400 with the issues on failure.
 */
@Injectable()
export class ZodValidationPipe<T = unknown> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodLikeSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        issues: result.error.issues,
      });
    }
    return result.data;
  }
}
