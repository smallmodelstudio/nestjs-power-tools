import { Transport } from '@nestjs/microservices';
import { createRedisOptions, redisOptionsFromEnv } from './redis.options.js';

describe('createRedisOptions', () => {
  it('applies defaults', () => {
    expect(createRedisOptions()).toEqual({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379 },
    });
  });

  it('lets overrides win', () => {
    expect(createRedisOptions({ host: 'redis', port: 1234 }).options).toMatchObject({
      host: 'redis',
      port: 1234,
    });
  });
});

describe('redisOptionsFromEnv', () => {
  it('maps env vars', () => {
    expect(redisOptionsFromEnv({ REDIS_HOST: 'h', REDIS_PORT: '7', REDIS_DB: '2' })).toEqual({
      host: 'h',
      port: 7,
      db: 2,
    });
  });

  it('returns nothing for an empty env', () => {
    expect(redisOptionsFromEnv({})).toEqual({});
  });
});
