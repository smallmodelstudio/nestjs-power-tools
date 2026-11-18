import { Transport, type RedisOptions } from '@nestjs/microservices';
import { REDIS_DEFAULT_HOST, REDIS_DEFAULT_PORT } from './redis.constants.js';

export type RedisTransportOptions = NonNullable<RedisOptions['options']>;

/**
 * Builds the options object accepted by `NestFactory.createMicroservice`,
 * `app.connectMicroservice` and `ClientsModule`, applying default host/port.
 */
export function createRedisOptions(options: RedisTransportOptions = {}): RedisOptions {
  return {
    transport: Transport.REDIS,
    options: {
      host: REDIS_DEFAULT_HOST,
      port: REDIS_DEFAULT_PORT,
      ...options,
    },
  };
}

/**
 * Reads connection details from environment variables
 * (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`).
 */
export function redisOptionsFromEnv(
  env: Record<string, string | undefined> = process.env,
): RedisTransportOptions {
  const options: RedisTransportOptions = {};
  if (env['REDIS_HOST']) options.host = env['REDIS_HOST'];
  if (env['REDIS_PORT']) options.port = Number(env['REDIS_PORT']);
  if (env['REDIS_PASSWORD']) options.password = env['REDIS_PASSWORD'];
  if (env['REDIS_DB']) options.db = Number(env['REDIS_DB']);
  return options;
}
