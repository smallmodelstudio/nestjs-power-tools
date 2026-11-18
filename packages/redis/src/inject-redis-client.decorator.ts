import { Inject } from '@nestjs/common';

/** Shorthand for `@Inject(name)` on a client registered via `RedisClientModule`. */
export const InjectRedisClient = (name: string | symbol) => Inject(name);
