import type { INestApplication } from '@nestjs/common';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { createKafkaOptions, type KafkaTransportOptions } from './kafka.options.js';

/** Creates a standalone Kafka microservice (`NestFactory.createMicroservice`). */
export function createKafkaMicroservice(
  module: Parameters<typeof NestFactory.createMicroservice>[0],
  options?: KafkaTransportOptions,
) {
  return NestFactory.createMicroservice<MicroserviceOptions>(module, createKafkaOptions(options));
}

/**
 * Attaches a Kafka microservice to an existing (hybrid) HTTP application.
 * Call `app.startAllMicroservices()` afterwards.
 */
export function connectKafkaMicroservice(app: INestApplication, options?: KafkaTransportOptions) {
  return app.connectMicroservice<MicroserviceOptions>(createKafkaOptions(options), {
    inheritAppConfig: true,
  });
}
