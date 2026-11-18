import type { INestApplication } from '@nestjs/common';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { createRedisOptions, type RedisTransportOptions } from './redis.options.js';

/** Creates a standalone Redis microservice (`NestFactory.createMicroservice`). */
export function createRedisMicroservice(
  module: Parameters<typeof NestFactory.createMicroservice>[0],
  options?: RedisTransportOptions,
) {
  return NestFactory.createMicroservice<MicroserviceOptions>(module, createRedisOptions(options));
}

/**
 * Attaches a Redis microservice to an existing (hybrid) HTTP application.
 * Call `app.startAllMicroservices()` afterwards.
 */
export function connectRedisMicroservice(app: INestApplication, options?: RedisTransportOptions) {
  return app.connectMicroservice<MicroserviceOptions>(createRedisOptions(options), {
    inheritAppConfig: true,
  });
}
